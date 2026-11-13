#include <inttypes.h>
#include <math.h>
#include <stdatomic.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include "board.h"
#include "protocol.h"
#include "actuators.h"
#include "android_uart.h"
#include "connectivity.h"
#include "digital_inputs.h"
#include "hx711.h"
#include "lcd_i2c.h"
#include "cJSON.h"
#include "esp_chip_info.h"
#include "esp_log.h"
#include "esp_random.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"

static const char *TAG = "smart_waste";
typedef struct { sw_command_t command; bool ai; } work_t;
typedef struct { sw_command_t command; char ack[384]; bool valid; } cached_t;
static QueueHandle_t work_queue;
static cached_t cache[32];
static unsigned cache_next;
static atomic_bool stopped;
static char boot_id[17];
static uint32_t sequence;
static bool hardware_ready, weight_valid, lcd_ready;
static double weight_kg;

static int64_t epoch_ms(void)
{
    struct timeval now;
    gettimeofday(&now, NULL);
    return (int64_t)now.tv_sec * 1000 + now.tv_usec / 1000;
}

static void publish_ack(const char *id, const char *status, const char *reason, char *copy)
{
    cJSON *ack = cJSON_CreateObject();
    if (!ack) return;
    cJSON_AddNumberToObject(ack, "v", 1);
    cJSON_AddStringToObject(ack, "device_id", CONFIG_SW_DEVICE_ID);
    if (id && id[0]) cJSON_AddStringToObject(ack, "id", id);
    else cJSON_AddNullToObject(ack, "id");
    cJSON_AddStringToObject(ack, "status", status);
    cJSON_AddStringToObject(ack, "reason", reason);
    char *json = cJSON_PrintUnformatted(ack);
    if (json) {
        if (copy) strlcpy(copy, json, 384);
        if (connectivity_send("ack", json, true) < 0) ESP_LOGW(TAG, "ACK outbox unavailable");
        free(json);
    }
    cJSON_Delete(ack);
}

static void receive_command(const char *data, size_t len)
{
    work_t work = {0};
    if (!sw_parse_command(data, len, &work.command)) {
        publish_ack(NULL, "rejected", "invalid_packet", NULL);
        return;
    }
    if (!strcmp(work.command.op, "stop")) {
        atomic_store(&stopped, true);
        actuators_request_stop();
    }
    if (xQueueSend(work_queue, &work, 0) != pdTRUE)
        publish_ack(work.command.id, "rejected", "queue_full", NULL);
}

static void receive_ai(const sw_command_t *ai)
{
    work_t work = {.command = *ai, .ai = true};
    if (xQueueSend(work_queue, &work, 0) != pdTRUE) ESP_LOGW(TAG, "AI queue full; result discarded");
}

static void on_disconnect(void)
{
    // A reconnect never unlocks physical actuators.
    actuators_request_stop();
}

static void telemetry(void)
{
    cJSON *root = cJSON_CreateObject();
    if (!root) return;
    cJSON_AddNumberToObject(root, "v", 1);
    cJSON_AddStringToObject(root, "device_id", CONFIG_SW_DEVICE_ID);
    cJSON_AddStringToObject(root, "boot_id", boot_id);
    cJSON_AddNumberToObject(root, "seq", ++sequence);
    cJSON_AddNumberToObject(root, "uptime_ms", esp_timer_get_time() / 1000);
#if CONFIG_SW_SIMULATION
    cJSON_AddStringToObject(root, "mode", "simulation");
#else
    cJSON_AddStringToObject(root, "mode", "hardware_locked");
#endif
    cJSON_AddStringToObject(root, "state", atomic_load(&stopped) ? "stopped" : "idle");
    cJSON_AddBoolToObject(root, "ir", ir_active());
    cJSON_AddBoolToObject(root, "limit", limit_active());
    cJSON_AddBoolToObject(root, "weight_valid", weight_valid);
    if (weight_valid) cJSON_AddNumberToObject(root, "weight_kg", weight_kg);
    else cJSON_AddNullToObject(root, "weight_kg");
    cJSON_AddNumberToObject(root, "free_heap", esp_get_free_heap_size());
    char *json = cJSON_PrintUnformatted(root);
    if (json) { connectivity_send("telemetry", json, false); free(json); }
    cJSON_Delete(root);
}

#if CONFIG_SW_SIMULATION
static bool classification_event(const sw_command_t *cmd)
{
    cJSON *root = cJSON_CreateObject();
    if (!root) return false;
    cJSON_AddNumberToObject(root, "v", 1);
    cJSON_AddStringToObject(root, "device_id", CONFIG_SW_DEVICE_ID);
    cJSON_AddStringToObject(root, "id", cmd->id);
    cJSON_AddStringToObject(root, "category", cmd->category);
    cJSON_AddStringToObject(root, "mode", "simulation");
    cJSON_AddNumberToObject(root, "confidence", cmd->confidence);
    cJSON_AddNumberToObject(root, "weight_kg", cmd->weight_kg);
    char *json = cJSON_PrintUnformatted(root);
    int result = json ? connectivity_send("event", json, true) : -1;
    free(json);
    cJSON_Delete(root);
    return result >= 0;
}
#endif

static void handle(const work_t *work)
{
    const sw_command_t *cmd = &work->command;
    for (unsigned i = 0; i < 32; ++i) {
        if (cache[i].valid && !strcmp(cache[i].command.id, cmd->id)) {
            if (!memcmp(&cache[i].command, cmd, sizeof(*cmd)))
                connectivity_send("ack", cache[i].ack, true);
            else publish_ack(cmd->id, "rejected", "id_conflict", NULL);
            return;
        }
    }
    const char *status = "ok", *reason = "completed";
    int64_t now = epoch_ms();
    if (work->ai) {
        status = "rejected"; reason = "hardware_route_uncalibrated";
        ESP_LOGI(TAG, "AI observation: %s %.1f%%; physical route remains locked", cmd->category, cmd->confidence);
    } else if (!strcmp(cmd->op, "stop")) {
        atomic_store(&stopped, true);
        actuators_stop();
        reason = "software_stop_only";
    } else if (!strcmp(cmd->op, "status")) {
        telemetry();
    } else if (now < 1704067200000LL) {
        status = "rejected"; reason = "clock_unsynced";
    } else if (cmd->expires_at < now || cmd->expires_at > now + 60000) {
        status = "rejected"; reason = "expired_or_invalid_ttl";
    } else if (!strcmp(cmd->op, "resume")) {
#if CONFIG_SW_SIMULATION
        atomic_store(&stopped, false);
        reason = "simulation_resumed";
#else
        status = "rejected"; reason = "hardware_locked";
#endif
    } else if (!strcmp(cmd->op, "tare")) {
        if (!hardware_ready || hx711_tare() != ESP_OK) {
            status = "rejected"; reason = "sensor_unavailable";
        }
    } else if (!strcmp(cmd->op, "simulate_sort")) {
#if CONFIG_SW_SIMULATION
        if (atomic_load(&stopped)) { status = "rejected"; reason = "stopped"; }
        else if (!classification_event(cmd)) { status = "rejected"; reason = "outbox_full"; }
        else { weight_kg = cmd->weight_kg; weight_valid = true; reason = "simulated"; }
#else
        status = "rejected"; reason = "hardware_locked";
#endif
    }
    cached_t *entry = &cache[cache_next++ % 32];
    entry->command = *cmd;
    entry->valid = false;
    entry->ack[0] = 0;
    publish_ack(cmd->id, status, reason, entry->ack);
    entry->valid = entry->ack[0] != 0;
    if (lcd_ready) lcd_i2c_line(1, reason);
}

void app_main(void)
{
    esp_chip_info_t chip;
    esp_chip_info(&chip);
    ESP_LOGI(TAG, "Smart Waste Sorting Firmware Initialized");
    ESP_LOGI(TAG, "ESP-IDF %s; ESP32 cores=%u revision=%u", esp_get_idf_version(), chip.cores, chip.revision);
    ESP_LOGW(TAG, "Motion is never triggered by MQTT or UART in TASK 2");
    snprintf(boot_id, sizeof(boot_id), "%08" PRIx32 "%08" PRIx32, esp_random(), esp_random());
    esp_err_t err = nvs_flash_init();
    if (err != ESP_OK) { ESP_LOGE(TAG, "NVS unavailable: %s; no automatic erase", esp_err_to_name(err)); return; }
    work_queue = xQueueCreate(8, sizeof(work_t));
    if (!work_queue) { ESP_LOGE(TAG, "Cannot allocate command queue"); return; }
#if !CONFIG_SW_SIMULATION && CONFIG_SW_WIRING_REVIEWED
    hardware_ready = digital_inputs_init() == ESP_OK && hx711_init() == ESP_OK;
    lcd_ready = lcd_i2c_init() == ESP_OK;
    if (lcd_ready) lcd_i2c_line(0, "EcoSmart READY");
#endif
    android_uart_init(receive_ai);
    err = connectivity_start(receive_command, on_disconnect);
    if (err != ESP_OK) ESP_LOGE(TAG, "Connectivity not started: %s", esp_err_to_name(err));
    int64_t next_report = 0, next_weight = 0;
    for (;;) {
        work_t work;
        if (xQueueReceive(work_queue, &work, pdMS_TO_TICKS(20)) == pdTRUE) handle(&work);
        digital_inputs_poll();
        if (atomic_load(&stopped) || !connectivity_online()) actuators_stop();
        int64_t now = esp_timer_get_time();
        if (hardware_ready && now >= next_weight) {
            weight_valid = hx711_weight(&weight_kg) == ESP_OK && isfinite(weight_kg) && weight_kg >= 0 && weight_kg <= 100;
            next_weight = now + 500000;
        }
        if (now >= next_report) {
            telemetry();
            ESP_LOGI(TAG, "Running: MQTT=%s heap=%" PRIu32, connectivity_online() ? "online" : "offline", esp_get_free_heap_size());
            next_report = now + 2000000;
        }
    }
}
