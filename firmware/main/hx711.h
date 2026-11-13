#pragma once
#include <stdint.h>
#include "esp_err.h"
esp_err_t hx711_init(void);
esp_err_t hx711_read_raw(int32_t *raw, uint32_t timeout_ms);
esp_err_t hx711_weight(double *kg);
esp_err_t hx711_tare(void);
