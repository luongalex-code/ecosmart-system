#include "digital_inputs.h"
#include "board.h"
#include "driver/gpio.h"
#include "esp_timer.h"

typedef struct { int pin, active, last; bool stable; int64_t changed; } input_t;
static input_t ir = {.pin = PIN_IR, .active = CONFIG_SW_IR_ACTIVE_LEVEL};
static input_t limit = {.pin = PIN_LIMIT, .active = CONFIG_SW_LIMIT_ACTIVE_LEVEL};
static bool ready;

esp_err_t digital_inputs_init(void)
{
    // No internal bias on strapping GPIO15: external circuitry must be reviewed.
    gpio_config_t cfg = {.pin_bit_mask = (1ULL << PIN_IR) | (1ULL << PIN_LIMIT),
                         .mode = GPIO_MODE_INPUT, .pull_up_en = GPIO_PULLUP_DISABLE,
                         .pull_down_en = GPIO_PULLDOWN_DISABLE};
    esp_err_t err = gpio_config(&cfg);
    if (err == ESP_OK) {
        ir.last = gpio_get_level(ir.pin);
        limit.last = gpio_get_level(limit.pin);
        ir.changed = limit.changed = esp_timer_get_time();
        ready = true;
    }
    return err;
}

static void poll(input_t *input)
{
    int level = gpio_get_level(input->pin);
    int64_t now = esp_timer_get_time();
    if (level != input->last) { input->last = level; input->changed = now; }
    if (now - input->changed >= 30000) input->stable = level == input->active;
}
void digital_inputs_poll(void) { if (ready) { poll(&ir); poll(&limit); } }
bool ir_active(void) { return ready && ir.stable; }
bool limit_active(void) { return ready && limit.stable; }
