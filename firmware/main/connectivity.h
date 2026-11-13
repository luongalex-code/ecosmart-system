#pragma once
#include <stdbool.h>
#include <stddef.h>
#include "esp_err.h"
typedef void (*sw_receive_t)(const char *data, size_t length);
typedef void (*sw_disconnect_t)(void);
esp_err_t connectivity_start(sw_receive_t receive, sw_disconnect_t disconnect);
bool connectivity_online(void);
int connectivity_send(const char *suffix, const char *json, bool reliable);
