#pragma once
#include <stdbool.h>
#include <stdint.h>
#include "esp_err.h"
void actuators_request_stop(void);
void actuators_stop(void);
// Local bench code only. Never exposed as an MQTT/UART command.
esp_err_t actuators_arm_local(void);
esp_err_t a4988_init(void);
esp_err_t a4988_steps(uint32_t steps, bool direction, uint32_t half_period_us);
esp_err_t servo_set_pulse(unsigned servo, unsigned pulse_us);
