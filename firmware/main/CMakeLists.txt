idf_component_register(SRCS "main.c" "protocol.c" "hx711.c" "digital_inputs.c"
                            "actuators.c" "lcd_i2c.c" "android_uart.c" "connectivity.c"
                       INCLUDE_DIRS "."
                       REQUIRES esp_system esp_hw_support freertos log nvs_flash esp_wifi
                                esp_event esp_netif esp_timer mqtt json esp-tls lwip
                                esp_driver_gpio esp_driver_ledc esp_driver_i2c esp_driver_uart)
