#include "protocol.h"
#include <math.h>
#include <string.h>
#include "cJSON.h"

bool sw_identifier(const char *s)
{
    if (!s || !s[0] || strlen(s) >= SW_ID_SIZE) return false;
    for (; *s; ++s) {
        if (!((*s >= 'a' && *s <= 'z') || (*s >= 'A' && *s <= 'Z') ||
              (*s >= '0' && *s <= '9') || *s == '-' || *s == '_')) return false;
    }
    return true;
}

bool sw_category(const char *s)
{
    return s && (!strcmp(s, "organic") || !strcmp(s, "recycle") || !strcmp(s, "other"));
}

static bool number(const cJSON *root, const char *name, double min, double max, double *out)
{
    const cJSON *n = cJSON_GetObjectItemCaseSensitive(root, name);
    if (!cJSON_IsNumber(n) || !isfinite(n->valuedouble) ||
        n->valuedouble < min || n->valuedouble > max) return false;
    *out = n->valuedouble;
    return true;
}

static bool parse(const char *json, size_t length, sw_command_t *out, bool ai)
{
    memset(out, 0, sizeof(*out));
    if (!json || !length || length > SW_MAX_PACKET || memchr(json, 0, length)) return false;
    const char *end = NULL;
    cJSON *root = cJSON_ParseWithLengthOpts(json, length, &end, false);
    if (!root) return false;
    bool valid = cJSON_IsObject(root);
    for (const char *p = end; valid && p < json + length; ++p) {
        if (*p != ' ' && *p != '\r' && *p != '\n' && *p != '\t') valid = false;
    }
    // Reject duplicate keys rather than letting parsers disagree about command meaning.
    for (const cJSON *a = root->child; valid && a; a = a->next) {
        for (const cJSON *b = a->next; b; b = b->next) {
            if (a->string && b->string && !strcmp(a->string, b->string)) valid = false;
        }
    }
    double version = 0;
    valid = valid && number(root, "v", 1, 1, &version);
    const cJSON *id = cJSON_GetObjectItemCaseSensitive(root, "id");
    const cJSON *op = cJSON_GetObjectItemCaseSensitive(root, ai ? "type" : "op");
    valid = valid && cJSON_IsString(id) && sw_identifier(id->valuestring) && cJSON_IsString(op);
    if (valid) {
        strcpy(out->id, id->valuestring);
        if (ai) valid = !strcmp(op->valuestring, "ai_result");
        else valid = !strcmp(op->valuestring, "status") || !strcmp(op->valuestring, "stop") ||
                     !strcmp(op->valuestring, "tare") || !strcmp(op->valuestring, "resume") ||
                     !strcmp(op->valuestring, "simulate_sort");
    }
    if (valid) strcpy(out->op, ai ? "ai_result" : op->valuestring);
    if (valid && !ai) {
        double expiry = 0;
        valid = number(root, "expires_at", 1, 9007199254740991.0, &expiry) && floor(expiry) == expiry;
        out->expires_at = (int64_t)expiry;
    }
    if (valid && (ai || !strcmp(out->op, "simulate_sort"))) {
        const cJSON *category = cJSON_GetObjectItemCaseSensitive(root, "category");
        valid = cJSON_IsString(category) && sw_category(category->valuestring) &&
                number(root, "confidence", 0, 100, &out->confidence);
        if (valid) strcpy(out->category, category->valuestring);
        if (!ai) valid = valid && number(root, "weight_kg", 0.001, 100, &out->weight_kg);
    }
    cJSON_Delete(root);
    if (!valid) memset(out, 0, sizeof(*out));
    return valid;
}

bool sw_parse_command(const char *json, size_t len, sw_command_t *out)
{
    return parse(json, len, out, false);
}
bool sw_parse_ai(const char *json, size_t len, sw_command_t *out)
{
    return parse(json, len, out, true);
}
