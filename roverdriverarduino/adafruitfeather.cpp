/*
  Board driver for the Adafruit Feather nRF52832
  This board is used as a simulator. It uses Nordic's softdevice for
  BLE, which can be interfaced using Adafruit's bluefruit library.

  Created in February 2021, Angelo L
*/

#include <Arduino.h>
#include <bluefruit.h>

#include "roverdriverarduino.h"

#ifdef BOARD_ADAFRUIT_nRF52832

// OTA DFU service
BLEDfu bledfu;

// Uart over BLE service
BLEUart bleuart;

rover_connect_callback_t mainConnectCallback;
rover_disconnect_callback_t mainDisconnectCallback;

// Function prototypes
void connect_callback(uint16_t conn_handle);
void disconnect_callback(uint16_t conn_handle, uint8_t reason);

void setupBoard() {
#ifdef DEBUG
  SERIAL_PORT_CONSOLE.begin(SERIAL_BAUD_CONSOLE);
  while (!SERIAL_PORT_CONSOLE) delay(10);  // for nrf52840 with native usb
  DEBUG_PRINTLN(F("Adafruit Bluefruit52 Rover Simulator"));
  DEBUG_PRINTLN(F("-------------------------------------------"));
#endif

  pinMode(PIN_LED_FORWARD, OUTPUT);
  pinMode(PIN_LED_BACK, OUTPUT);
  pinMode(PIN_LED_LEFT, OUTPUT);
  pinMode(PIN_LED_RIGHT, OUTPUT);
}

void startBluetooth() {
  Bluefruit.begin();
  Bluefruit.setTxPower(4);  // Check bluefruit.h for supported values
  Bluefruit.setName("rover-0001");

  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);
  // To be consistent OTA DFU should be added first if it exists
  bledfu.begin();

  // Configure and start the BLE Uart service
  bleuart.begin();

  // Set up and start advertising
  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include the BLE UART (AKA 'NUS') 128-bit UUID
  Bluefruit.Advertising.addService(bleuart);

  // Secondary Scan Response packet (optional)
  // Since there is no room for 'Name' in Advertising packet
  Bluefruit.ScanResponse.addName();

  /* Start Advertising
   * - Enable auto advertising if disconnected
   * - Interval:  fast mode = 20 ms, slow mode = 152.5 ms
   * - Timeout for fast mode is 30 seconds
   * - Start(timeout) with timeout = 0 will advertise forever (until connected)
   *
   * For recommended advertising interval
   * https://developer.apple.com/library/content/qa/qa1931/_index.html
   */
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);  // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30);    // number of seconds in fast mode
  Bluefruit.Advertising.start(0);  // 0 = Don't stop advertising after n seconds

  DEBUG_PRINTLN(F("Ready for connection in Controller mode"));
}

uint8_t getIncoming() { return readPacket(&bleuart, 250); }

void sendMessage(uint8_t* message, int message_len) {
  bleuart.write(message, message_len);
}

int8_t getRssi() {
  if (Bluefruit.connected()) {
    uint16_t conn_hdl = Bluefruit.connHandle();

    // Get the reference to current connected connection
    BLEConnection* connection = Bluefruit.Connection(conn_hdl);

    // get the RSSI value of this connection
    // monitorRssi() must be called previously (in connect callback)
    return (connection->getRssi());
  }
}

void setConnectCallback(rover_connect_callback_t connect_callback) {
  mainConnectCallback = connect_callback;
}

void setDisconnectCallback(rover_disconnect_callback_t disconnect_callback) {
  mainDisconnectCallback = disconnect_callback;
}

void connect_callback(uint16_t conn_handle) {
  // Get the reference to current connection
  BLEConnection* connection = Bluefruit.Connection(conn_handle);

  char central_name[32] = {0};
  connection->getPeerName(central_name, sizeof(central_name));

  // Start monitoring rssi of this connection
  // This function should be called in connect callback
  // no parameters means we don't use rssi changed callback
  connection->monitorRssi();

  // Report back if a connection callback was set
  if (mainConnectCallback) mainConnectCallback(central_name);
}

/**
 * Callback invoked when a connection is dropped
 * @param conn_handle connection where this event happens
 * @param reason is a BLE_HCI_STATUS_CODE which can be found in ble_hci.h
 */
void disconnect_callback(uint16_t conn_handle, uint8_t reason) {
  (void)conn_handle;
  (void)reason;
  if (mainDisconnectCallback) mainDisconnectCallback(reason);
}

#endif