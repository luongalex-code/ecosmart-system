#pragma once
#include "esp_err.h"
esp_err_t lcd_i2c_init(void);
esp_err_t lcd_i2c_line(unsigned row, const char *text);
