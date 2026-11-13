#include "lcd_i2c.h"
#include "board.h"
#include "driver/i2c_master.h"
#include "esp_rom_sys.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#if CONFIG_SW_LCD_CONFIRMED && !CONFIG_SW_SIMULATION
static i2c_master_dev_handle_t device;
static esp_err_t nibble(uint8_t value, bool data)
{
    // Supported backpack mapping only: RS=P0, RW=P1, E=P2, backlight=P3, D4..7=P4..7.
    uint8_t b = (value & 0xf0) | 0x08 | (data ? 1 : 0);
    uint8_t bytes[] = {b, (uint8_t)(b | 4), b};
    return i2c_master_transmit(device, bytes, sizeof(bytes), 50);
}
static esp_err_t byte(uint8_t value, bool data)
{
    esp_err_t err = nibble(value, data);
    if (err == ESP_OK) err = nibble(value << 4, data);
    esp_rom_delay_us(50);
    return err;
}
#endif

esp_err_t lcd_i2c_init(void)
{
#if CONFIG_SW_LCD_CONFIRMED && !CONFIG_SW_SIMULATION
    int sda = CONFIG_SW_LCD_SDA, scl = CONFIG_SW_LCD_SCL;
    if (sda < 0 || scl < 0 || sda == scl || sw_pin_reserved(sda) || sw_pin_reserved(scl))
        return ESP_ERR_INVALID_ARG;
    i2c_master_bus_handle_t bus;
    i2c_master_bus_config_t cfg = {.i2c_port = I2C_NUM_0, .sda_io_num = sda,
        .scl_io_num = scl, .clk_source = I2C_CLK_SRC_DEFAULT, .glitch_ignore_cnt = 7,
        .flags.enable_internal_pullup = false};
    esp_err_t err = i2c_new_master_bus(&cfg, &bus);
    if (err != ESP_OK) return err;
    i2c_device_config_t dev = {.dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = CONFIG_SW_LCD_ADDRESS, .scl_speed_hz = 100000};
    err = i2c_master_bus_add_device(bus, &dev, &device);
    if (err != ESP_OK) { i2c_del_master_bus(bus); return err; }
    vTaskDelay(pdMS_TO_TICKS(50));
    err = nibble(0x30, false);
    vTaskDelay(pdMS_TO_TICKS(5));
    if (err == ESP_OK) err = nibble(0x30, false);
    esp_rom_delay_us(150);
    if (err == ESP_OK) err = nibble(0x30, false);
    if (err == ESP_OK) err = nibble(0x20, false);
    if (err == ESP_OK) err = byte(0x28, false);
    if (err == ESP_OK) err = byte(0x0c, false);
    if (err == ESP_OK) err = byte(0x06, false);
    if (err == ESP_OK) err = byte(0x01, false);
    vTaskDelay(pdMS_TO_TICKS(3));
    return err;
#else
    return ESP_ERR_NOT_SUPPORTED;
#endif
}

esp_err_t lcd_i2c_line(unsigned row, const char *text)
{
#if CONFIG_SW_LCD_CONFIRMED && !CONFIG_SW_SIMULATION
    if (!device || !text || row > 1) return ESP_ERR_INVALID_ARG;
    esp_err_t err = byte((row ? 0xc0 : 0x80), false);
    bool ended = false;
    for (unsigned i = 0; i < CONFIG_SW_LCD_COLUMNS && err == ESP_OK; ++i) {
        if (!ended && !text[i]) ended = true;
        err = byte(ended ? ' ' : (uint8_t)text[i], true);
    }
    return err;
#else
    (void)row; (void)text;
    return ESP_ERR_NOT_SUPPORTED;
#endif
}
