#include "connectivity.h"
#include "board.h"
#include "protocol.h"
#include <stdio.h>
#include <string.h>
#include <stdatomic.h>
#include "esp_crt_bundle.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_sntp.h"
#include "esp_wifi.h"
#include "mqtt_client.h"

static const char *TAG = "connectivity";
static esp_mqtt_client_handle_t client;
static atomic_bool online;
static sw_receive_t receiver;
static sw_disconnect_t on_disconnect;
static char base[128], command_topic[140];
static char packet[SW_MAX_PACKET + 1];
static int received, expected;
static bool accepting;

bool connectivity_online(void) { return atomic_load(&online); }
int connectivity_send(const char *suffix, const char *json, bool reliable)
{
    if (!client) return -1;
    char topic[160];
    snprintf(topic, sizeof(topic), "%s/%s", base, suffix);
    if (reliable) return esp_mqtt_client_enqueue(client, topic, json, 0, 1, 0, true);
    if (!connectivity_online()) return -1;
    return esp_mqtt_client_publish(client, topic, json, 0, 0, 0);
}

static void mqtt_event(void *arg, esp_event_base_t event_base, int32_t id, void *event_data)
{
    (void)arg; (void)event_base;
    esp_mqtt_event_handle_t event = event_data;
    if (id == MQTT_EVENT_CONNECTED) {
        atomic_store(&online, true);
        esp_mqtt_client_subscribe(client, command_topic, 1);
        char topic[160];
        snprintf(topic, sizeof(topic), "%s/status", base);
        esp_mqtt_client_publish(client, topic, "{\"v\":1,\"online\":true}", 0, 1, 1);
        ESP_LOGI(TAG, "EMQX connected");
    } else if (id == MQTT_EVENT_DISCONNECTED) {
        atomic_store(&online, false);
        accepting = false;
        if (on_disconnect) on_disconnect();
        ESP_LOGW(TAG, "MQTT disconnected; motion locked");
    } else if (id == MQTT_EVENT_DATA) {
        if (event->current_data_offset == 0) {
            received = 0;
            expected = event->total_data_len;
            accepting = !event->retain && expected > 0 && expected <= SW_MAX_PACKET &&
                event->topic_len == (int)strlen(command_topic) &&
                !memcmp(event->topic, command_topic, event->topic_len);
        }
        if (!accepting || event->current_data_offset != received || event->data_len < 0 ||
            received + event->data_len > expected) { accepting = false; return; }
        memcpy(packet + received, event->data, event->data_len);
        received += event->data_len;
        if (received == expected) {
            packet[received] = 0;
            accepting = false;
            if (receiver) receiver(packet, received);
        }
    } else if (id == MQTT_EVENT_ERROR) {
        ESP_LOGW(TAG, "MQTT connection error; automatic reconnect enabled");
    }
}

static void wifi_event(void *arg, esp_event_base_t event_base, int32_t id, void *data)
{
    (void)arg; (void)data;
    if (event_base == WIFI_EVENT && id == WIFI_EVENT_STA_START) esp_wifi_connect();
    else if (event_base == WIFI_EVENT && id == WIFI_EVENT_STA_DISCONNECTED) {
        atomic_store(&online, false);
        if (on_disconnect) on_disconnect();
        esp_wifi_connect();
    } else if (event_base == IP_EVENT && id == IP_EVENT_STA_GOT_IP) {
        ESP_LOGI(TAG, "Wi-Fi acquired IP");
        if (client) esp_mqtt_client_reconnect(client);
    }
}

esp_err_t connectivity_start(sw_receive_t receive, sw_disconnect_t disconnect)
{
    receiver = receive; on_disconnect = disconnect;
    if (!sw_identifier(CONFIG_SW_DEVICE_ID)) return ESP_ERR_INVALID_ARG;
    if (!strlen(CONFIG_SW_WIFI_SSID) || !strlen(CONFIG_SW_MQTT_URI)) {
        ESP_LOGW(TAG, "Wi-Fi/MQTT not provisioned; local safe mode remains active");
        return ESP_OK;
    }
    bool tls = !strncmp(CONFIG_SW_MQTT_URI, "mqtts://", 8);
    if (!tls) {
#if CONFIG_SW_ALLOW_PLAINTEXT_MQTT
        if (strncmp(CONFIG_SW_MQTT_URI, "mqtt://", 7)) return ESP_ERR_INVALID_ARG;
#else
        return ESP_ERR_INVALID_ARG;
#endif
    }
    snprintf(base, sizeof(base), "ecosmart/v1/devices/%s", CONFIG_SW_DEVICE_ID);
    snprintf(command_topic, sizeof(command_topic), "%s/command", base);
    char status_topic[160];
    snprintf(status_topic, sizeof(status_topic), "%s/status", base);
    esp_mqtt_client_config_t mqtt = {
        .broker.address.uri = CONFIG_SW_MQTT_URI,
        .broker.verification.crt_bundle_attach = tls ? esp_crt_bundle_attach : NULL,
        .credentials.client_id = CONFIG_SW_DEVICE_ID,
        .credentials.username = CONFIG_SW_MQTT_USERNAME,
        .credentials.authentication.password = CONFIG_SW_MQTT_PASSWORD,
        .session.last_will = {.topic = status_topic, .msg = "{\"v\":1,\"online\":false}", .qos = 1, .retain = 1},
        .network.reconnect_timeout_ms = 3000,
        .buffer.size = 2048,
        .outbox.limit = 16384,
    };
    client = esp_mqtt_client_init(&mqtt);
    if (!client) return ESP_ERR_NO_MEM;
    esp_err_t err = esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event, NULL);
    if (err != ESP_OK) return err;
    err = esp_netif_init();
    if (err != ESP_OK) return err;
    err = esp_event_loop_create_default();
    if (err != ESP_OK) return err;
    if (!esp_netif_create_default_wifi_sta()) return ESP_ERR_NO_MEM;
    wifi_init_config_t init = WIFI_INIT_CONFIG_DEFAULT();
    if ((err = esp_wifi_init(&init)) != ESP_OK) return err;
    if ((err = esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, wifi_event, NULL)) != ESP_OK) return err;
    if ((err = esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, wifi_event, NULL)) != ESP_OK) return err;
    wifi_config_t wifi = {0};
    strlcpy((char *)wifi.sta.ssid, CONFIG_SW_WIFI_SSID, sizeof(wifi.sta.ssid));
    strlcpy((char *)wifi.sta.password, CONFIG_SW_WIFI_PASSWORD, sizeof(wifi.sta.password));
    wifi.sta.threshold.authmode = WIFI_AUTH_WPA2_PSK;
    wifi.sta.pmf_cfg.capable = true;
    if ((err = esp_wifi_set_storage(WIFI_STORAGE_RAM)) != ESP_OK) return err;
    if ((err = esp_wifi_set_mode(WIFI_MODE_STA)) != ESP_OK) return err;
    if ((err = esp_wifi_set_config(WIFI_IF_STA, &wifi)) != ESP_OK) return err;
    esp_sntp_setoperatingmode(SNTP_OPMODE_POLL);
    esp_sntp_setservername(0, "pool.ntp.org");
    esp_sntp_init();
    if ((err = esp_mqtt_client_start(client)) != ESP_OK) return err;
    return esp_wifi_start();
}
