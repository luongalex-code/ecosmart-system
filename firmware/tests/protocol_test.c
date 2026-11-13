#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "protocol.h"

int main(void)
{
    sw_command_t command;
    const char *good = "{\"v\":1,\"id\":\"cmd-1\",\"op\":\"simulate_sort\",\"expires_at\":1900000000000,\"category\":\"organic\",\"confidence\":95,\"weight_kg\":1.25}";
    assert(sw_parse_command(good, strlen(good), &command));
    assert(!strcmp(command.id, "cmd-1") && command.weight_kg == 1.25);
    const char *invalid[] = {
        "{}", "[]", "null", "{\"v\":2}",
        "{\"v\":1,\"id\":\"../bad\",\"op\":\"status\",\"expires_at\":1}",
        "{\"v\":1,\"id\":\"x\",\"op\":\"servo\",\"expires_at\":1}",
        "{\"v\":1,\"id\":\"x\",\"op\":\"stop\",\"op\":\"status\",\"expires_at\":1}",
        "{\"v\":1,\"id\":\"x\",\"op\":\"stop\",\"expires_at\":1.1}",
        "{\"v\":1,\"id\":\"x\",\"op\":\"stop\",\"expires_at\":1}garbage",
        "{\"v\":1,\"id\":\"x\",\"op\":\"simulate_sort\",\"expires_at\":1,\"category\":\"organic\",\"confidence\":101,\"weight_kg\":2}",
        "{\"v\":1,\"id\":\"x\",\"op\":\"simulate_sort\",\"expires_at\":1,\"category\":\"organic\",\"confidence\":99,\"weight_kg\":-2}"
    };
    for (unsigned i = 0; i < sizeof(invalid) / sizeof(invalid[0]); ++i)
        assert(!sw_parse_command(invalid[i], strlen(invalid[i]), &command));
    char overflow[SW_MAX_PACKET + 2];
    memset(overflow, ' ', sizeof(overflow));
    assert(!sw_parse_command(overflow, sizeof(overflow), &command));
    const char nul[] = "{\"v\":1}\0{}";
    assert(!sw_parse_command(nul, sizeof(nul) - 1, &command));
    const char *ai = "{\"v\":1,\"type\":\"ai_result\",\"id\":\"ai-1\",\"category\":\"recycle\",\"confidence\":92.5}\r";
    assert(sw_parse_ai(ai, strlen(ai), &command));
    assert(!strcmp(command.op, "ai_result"));
    puts("PASS: native firmware parser: valid commands, AI, malformed JSON, limits, duplicate keys, overflow, NUL, trailing data");
    return 0;
}
