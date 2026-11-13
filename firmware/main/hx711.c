#include "hx711.h"
#include "board.h"
#include "driver/gpio.h"
#include "esp_check.h"
#include "esp_rom_sys.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static portMUX_TYPE clock_lock = portMUX_INITIALIZER_UNLOCKED;
static int32_t offset = CONFIG_SW_HX711_OFFSET;
static bool ready;

esp_err_t hx711_init(void)
{
    gpio_config_t input = {.pin_bit_mask = 1ULL << PIN_HX_DT, .mode = GPIO_MODE_INPUT};
    gpio_config_t output = {.pin_bit_mask = 1ULL << PIN_HX_SCK, .mode = GPIO_MODE_OUTPUT};
    ESP_RETURN_ON_ERROR(gpio_config(&input), "hx711", "DT");
    ESP_RETURN_ON_ERROR(gpio_set_level(PIN_HX_SCK, 0), "hx711", "SCK low");
    ESP_RETURN_ON_ERROR(gpio_config(&output), "hx711", "SCK");
    ready = true;
    return ESP_OK;
}

esp_err_t hx711_read_raw(int32_t *raw, uint32_t timeout_ms)
{
    if (!ready || !raw) return ESP_ERR_INVALID_STATE;
    const int64_t deadline = esp_timer_get_time() + (int64_t)timeout_ms * 1000;
    while (gpio_get_level(PIN_HX_DT)) {
        if (esp_timer_get_time() >= deadline) return ESP_ERR_TIMEOUT;
        vTaskDelay(pdMS_TO_TICKS(10));
    }
    uint32_t bits = 0;
    // Prevent preemption while SCK is high: >60 us would power down the HX711.
    portENTER_CRITICAL(&clock_lock);
    for (int i = 0; i < 25; ++i) {
        gpio_set_level(PIN_HX_SCK, 1);
        esp_rom_delay_us(1);
        if (i < 24) bits = (bits << 1) | gpio_get_level(PIN_HX_DT);
        gpio_set_level(PIN_HX_SCK, 0);
        esp_rom_delay_us(1);
    }
    portEXIT_CRITICAL(&clock_lock);
    *raw = (int32_t)((bits & 0x800000) ? (bits | 0xff000000U) : bits);
    return ESP_OK;
}

esp_err_t hx711_weight(double *kg)
{
    if (!kg || CONFIG_SW_HX711_COUNTS_PER_KG == 0) return ESP_ERR_INVALID_STATE;
    int32_t raw;
    esp_err_t err = hx711_read_raw(&raw, 150);
    if (err == ESP_OK) *kg = ((double)raw - offset) / (double)CONFIG_SW_HX711_COUNTS_PER_KG;
    return err;
}

esp_err_t hx711_tare(void)
{
    int64_t sum = 0;
    for (int i = 0; i < 8; ++i) {
        int32_t raw;
        esp_err_t err = hx711_read_raw(&raw, 200);
        if (err != ESP_OK) return err;
        sum += raw;
    }
    offset = (int32_t)(sum / 8);
    return ESP_OK;
}
