#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define SW_MAX_PACKET 1024
#define SW_ID_SIZE 65
typedef struct {
    char id[SW_ID_SIZE];
    char op[24];
    char category[16];
    double weight_kg;
    double confidence;
    int64_t expires_at;
} sw_command_t;

bool sw_identifier(const char *value);
bool sw_category(const char *value);
bool sw_parse_command(const char *json, size_t length, sw_command_t *out);
bool sw_parse_ai(const char *json, size_t length, sw_command_t *out);
