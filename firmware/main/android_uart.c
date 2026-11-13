#include "android_uart.h"
#include "board.h"
#include <stdio.h>
#include <string.h>
#include "driver/uart.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#if !CONFIG_SW_SIMULATION && CONFIG_SW_WIRING_REVIEWED
static android_ai_callback_t on_ai;
static void uart_worker(void *arg)
{
    (void)arg;
    char line[SW_MAX_PACKET + 1];
    size_t length = 0;
    bool overflow = false;
    int64_t last = 0;
    for (;;) {
        uint8_t c;
        int read = uart_read_bytes(UART_NUM_2, &c, 1, pdMS_TO_TICKS(20));
        if (length && esp_timer_get_time() - last > 2000000) { length = 0; overflow = true; }
        if (read != 1) continue;
        last = esp_timer_get_time();
        if (c == '\n') {
            sw_command_t ai;
            bool valid = !overflow && sw_parse_ai(line, length, &ai);
            if (valid && on_ai) on_ai(&ai);
            const char *reply = valid ? "{\"v\":1,\"type\":\"uart_ack\",\"status\":\"received\"}\n"
                                      : "{\"v\":1,\"type\":\"uart_ack\",\"status\":\"invalid\"}\n";
            uart_write_bytes(UART_NUM_2, reply, strlen(reply));
            length = 0; overflow = false;
        } else if (length < SW_MAX_PACKET && !overflow) {
            line[length++] = (char)c;
        } else {
            overflow = true;
        }
    }
}

#endif

esp_err_t android_uart_init(android_ai_callback_t callback)
{
#if CONFIG_SW_SIMULATION || !CONFIG_SW_WIRING_REVIEWED
    (void)callback;
    return ESP_ERR_NOT_SUPPORTED;
#else
    uart_config_t cfg = {.baud_rate = CONFIG_SW_UART_BAUD, .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE, .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE, .source_clk = UART_SCLK_DEFAULT};
    esp_err_t err = uart_param_config(UART_NUM_2, &cfg);
    if (err != ESP_OK) return err;
    err = uart_set_pin(UART_NUM_2, PIN_UART_TX, PIN_UART_RX, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
    if (err != ESP_OK) return err;
    err = uart_driver_install(UART_NUM_2, 2048, 0, 0, NULL, 0);
    if (err != ESP_OK) return err;
    on_ai = callback;
    if (xTaskCreate(uart_worker, "android_uart", 4096, NULL, 5, NULL) != pdPASS) {
        uart_driver_delete(UART_NUM_2);
        return ESP_ERR_NO_MEM;
    }
    return ESP_OK;
#endif
}
