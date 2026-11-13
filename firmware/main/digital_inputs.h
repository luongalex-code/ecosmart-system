#pragma once
#include <stdbool.h>
#include "esp_err.h"
esp_err_t digital_inputs_init(void);
void digital_inputs_poll(void);
bool ir_active(void);
bool limit_active(void);
