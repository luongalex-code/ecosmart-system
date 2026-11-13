#pragma once
#include "sdkconfig.h"
#define PIN_HX_DT 19
#define PIN_HX_SCK 18
#define PIN_STEP 26
#define PIN_DIR 27
#define PIN_SERVO1 13
#define PIN_SERVO2 12
#define PIN_IR 14
#define PIN_LIMIT 15
#define PIN_UART_RX 16
#define PIN_UART_TX 17

static inline int sw_pin_reserved(int pin)
{
    const int pins[] = {0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                        16, 17, 18, 19, 26, 27};
    for (unsigned i = 0; i < sizeof(pins) / sizeof(pins[0]); ++i) {
        if (pin == pins[i]) return 1;
    }
    return 0;
}
