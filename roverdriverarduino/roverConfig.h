/*
  Header file containing system wide configuration parameters
*/

#ifndef _ROVERCONFIG_H
#define _ROVERCONFIG_H

// Uncomment ONE of these depending on targeted board
#define BOARD_ADAFRUIT_nRF52832  // Board used to simulate rover
// #define BOARD_ARDUINO_NANO33BLE  // Rover

// Uncomment to use simulated data instead of real data
#define USE_SIMULATED_DATA

#define PERIPHERAL_NAME "rover-0001"

#ifdef BOARD_ARDUINO_NANO33BLE
#define PIN_LED_FORWARD 2
#define PIN_LED_BACK 3
#define PIN_LED_LEFT 4
#define PIN_LED_RIGHT 5
#define PIN_LED_MODE_0 6
#define PIN_LED_MODE_1 7
#define PIN_LED_MODE_2 8
#define PIN_A_VOLTAGE A7
#endif

#ifdef BOARD_ADAFRUIT_nRF52832
#define PIN_LED_FORWARD 7
#define PIN_LED_BACK 16
#define PIN_LED_LEFT 15
#define PIN_LED_RIGHT 11
#define PIN_LED_MODE_0 6
#define PIN_LED_MODE_1 7
#define PIN_LED_MODE_2 8
#endif

// #define DEBUG  // Comment this line out to disable debug printing to USB serial

#ifdef DEBUG
#define DEBUG_PRINTLN(x) SERIAL_PORT_CONSOLE.println(x)
#define DEBUG_PRINT(x) SERIAL_PORT_CONSOLE.print(x)
#define DEBUG_PRINT2(x, y) SERIAL_PORT_CONSOLE.print(x, y)
#else
#define DEBUG_PRINTLN(x)
#define DEBUG_PRINT(x)
#define DEBUG_PRINT2(x, y)
#endif

// Console
#define SERIAL_PORT_CONSOLE Serial
#define SERIAL_BAUD_CONSOLE 115200

// Rover to controller update intervals in milliseconds
#define INTERVAL_REALTIME 100
#define INTERVAL_QUICK 500
#define INTERVAL_SLOW 4800

//    READ_BUFSIZE            Size of the BLE read buffer for incoming packets
#define READ_BUFSIZE (20)

// Communication headers and content hengths
// Message header and message lengths in bytes
// Length should include header and checksum (2 bytes total)
#define TX_MODE (0xA1)     // Operating mode
#define TX_VOLTAGE (0xA2)  // Battery voltage
#define TX_MILLIS (0xA3)   // On Time
#define TX_RSSI (0xA4)     // Connection RSSI

#define TX_ACCEL (0xB1)   // Accelerometer
#define TX_GYRO (0xB2)    // Gyroscope
#define TX_MAGNET (0xB3)  // Magnetometer

#define TX_SPEED (0xCE)  // Motor speed

#define RX_STOP (0xC0)  // Stop all motors. Enter 0x01 (under control) mode
#define RX_STOP_LEN 3
#define RX_CONTROL (0xC1)  // Enter 0x02 (motors under control) mode
#define RX_CONTROL_LEN 3
#define RX_KEY (0xCA)  // Key pressed
#define RX_KEY_LEN 5
#define RX_SPEED_SET (0xCE)  // Set targeted speed ("1" - "10")
#define RX_SPEED_SET_LEN 5

typedef void (*rover_connect_callback_t)(char *conn_hdl);
typedef void (*rover_disconnect_callback_t)(uint8_t reason);
typedef void (*rover_RX_callback_t)(uint8_t len);

// Device operating mode
#define MODE_IDLE (0x00)        // Rover idle
#define MODE_CONNECTED (0x01)   // Rover connected to controller, stand clear
#define MODE_CONTROLLED (0x02)  // Motors under control, do not approach

#endif