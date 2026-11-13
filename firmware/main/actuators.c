#include "actuators.h"
#include "board.h"
#include <stdatomic.h>
#include "digital_inputs.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_rom_sys.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static atomic_bool stopped = true;
#if CONFIG_SW_MOTION_CALIBRATED && !CONFIG_SW_SIMULATION
static bool step_ready, timer_ready, servo_ready[2];
#endif

void actuators_request_stop(void) { atomic_store(&stopped, true); }
esp_err_t actuators_arm_local(void)
{
#if CONFIG_SW_MOTION_CALIBRATED && !CONFIG_SW_SIMULATION
    if (!step_ready || gpio_get_level(PIN_LIMIT) == CONFIG_SW_LIMIT_ACTIVE_LEVEL)
        return ESP_ERR_INVALID_STATE;
    atomic_store(&stopped, false);
    return ESP_OK;
#else
    return ESP_ERR_NOT_SUPPORTED;
#endif
}
void actuators_stop(void)
{
    actuators_request_stop();
#if CONFIG_SW_MOTION_CALIBRATED && !CONFIG_SW_SIMULATION
    if (step_ready) gpio_set_level(PIN_STEP, 0);
    for (int i = 0; i < 2; ++i) {
        if (servo_ready[i]) ledc_stop(LEDC_LOW_SPEED_MODE, (ledc_channel_t)i, 0);
    }
#endif
}

esp_err_t a4988_init(void)
{
#if CONFIG_SW_MOTION_CALIBRATED && !CONFIG_SW_SIMULATION
    gpio_set_level(PIN_STEP, 0);
    gpio_set_level(PIN_DIR, 0);
    gpio_config_t cfg = {.pin_bit_mask = (1ULL << PIN_STEP) | (1ULL << PIN_DIR),
                         .mode = GPIO_MODE_OUTPUT};
    esp_err_t err = gpio_config(&cfg);
    step_ready = err == ESP_OK;
    return err;
#else
    return ESP_ERR_NOT_SUPPORTED;
#endif
}

esp_err_t a4988_steps(uint32_t steps, bool direction, uint32_t half_period_us)
{
#if CONFIG_SW_MOTION_CALIBRATED && !CONFIG_SW_SIMULATION
    if (!step_ready || steps > 200 || !steps || half_period_us < 1000 || half_period_us > 5000)
        return ESP_ERR_INVALID_ARG;
    digital_inputs_poll();
    if (limit_active()) return ESP_ERR_INVALID_STATE;
    if (atomic_load(&stopped)) return ESP_ERR_INVALID_STATE;
    gpio_set_level(PIN_DIR, direction);
    esp_rom_delay_us(2);
    for (uint32_t i = 0; i < steps; ++i) {
        // Raw limit read supplements the debounced software state for faster stopping.
        if (atomic_load(&stopped) || gpio_get_level(PIN_LIMIT) == CONFIG_SW_LIMIT_ACTIVE_LEVEL) {
            gpio_set_level(PIN_STEP, 0);
            return ESP_ERR_INVALID_STATE;
        }
        gpio_set_level(PIN_STEP, 1);
        esp_rom_delay_us(half_period_us);
        gpio_set_level(PIN_STEP, 0);
        esp_rom_delay_us(half_period_us);
        vTaskDelay(1);
    }
    return ESP_OK;
#else
    (void)steps; (void)direction; (void)half_period_us;
    return ESP_ERR_NOT_SUPPORTED;
#endif
}

esp_err_t servo_set_pulse(unsigned servo, unsigned pulse_us)
{
#if CONFIG_SW_MOTION_CALIBRATED && !CONFIG_SW_SIMULATION
    if (servo > 1 || pulse_us < 1000 || pulse_us > 2000) return ESP_ERR_INVALID_ARG;
    if (atomic_load(&stopped)) return ESP_ERR_INVALID_STATE;
    if (!timer_ready) {
        ledc_timer_config_t timer = {.speed_mode = LEDC_LOW_SPEED_MODE, .timer_num = LEDC_TIMER_0,
            .duty_resolution = LEDC_TIMER_16_BIT, .freq_hz = 50, .clk_cfg = LEDC_AUTO_CLK};
        esp_err_t err = ledc_timer_config(&timer);
        if (err != ESP_OK) return err;
        timer_ready = true;
    }
    if (!servo_ready[servo]) {
        ledc_channel_config_t channel = {.gpio_num = servo ? PIN_SERVO2 : PIN_SERVO1,
            .speed_mode = LEDC_LOW_SPEED_MODE, .channel = (ledc_channel_t)servo,
            .timer_sel = LEDC_TIMER_0, .duty = 0};
        esp_err_t err = ledc_channel_config(&channel);
        if (err != ESP_OK) return err;
        servo_ready[servo] = true;
    }
    esp_err_t err = ledc_set_duty(LEDC_LOW_SPEED_MODE, (ledc_channel_t)servo,
                                (uint32_t)((uint64_t)pulse_us * 65536 / 20000));
    return err == ESP_OK ? ledc_update_duty(LEDC_LOW_SPEED_MODE, (ledc_channel_t)servo) : err;
#else
    (void)servo; (void)pulse_us;
    return ESP_ERR_NOT_SUPPORTED;
#endif
}
