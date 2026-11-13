#pragma once
#include "protocol.h"
#include "esp_err.h"
typedef void (*android_ai_callback_t)(const sw_command_t *result);
esp_err_t android_uart_init(android_ai_callback_t callback);
