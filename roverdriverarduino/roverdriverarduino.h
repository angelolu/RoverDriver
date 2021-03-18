#ifndef _ROVERDRIVERARDUINO_H
#define _ROVERDRIVERARDUINO_H

// Keycodes
#define KEY_INCREASE 1  // Increase speed
#define KEY_DECREASE 2  // Decrease speed
#define KEY_FORWARD 5
#define KEY_REVERSE 6
#define KEY_LEFT 7
#define KEY_RIGHT 8

// Function prototypes for roverdriverarduino.ino
void handleRX(uint8_t len);
void setMode(uint8_t mode);
void connect_callback_main(char *central_name);

/**
 * Callback invoked when a connection is dropped
 * @param reason is a BLE_HCI_STATUS_CODE which can be found in ble_hci.h
 */
void disconnect_callback_main(uint8_t reason);

// Function prototypes that each "board driver" needs to implement
void setupBoard();
void startBluetooth();
void setConnectCallback(rover_connect_callback_t connect_callback);
void setDisconnectCallback(rover_disconnect_callback_t disconnect_callback);
void setRXCallback(rover_RX_callback_t RX_callback);
uint8_t getIncoming();
int8_t getRssi();
void sendMessage(uint8_t *message, int message_len);
void getGyroString(uint8_t *buf_imu);
void getAccelString(uint8_t *buf_imu);
void getFieldString(uint8_t *buf_imu);
#endif