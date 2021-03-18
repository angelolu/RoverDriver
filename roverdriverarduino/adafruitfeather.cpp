/*
  Board driver for the Adafruit Feather nRF52832
  This board is used as a simulator. It uses Nordic's softdevice for
  BLE, which can be interfaced using Adafruit's bluefruit library.

  Created in February 2021, Angelo L
*/

#include <Arduino.h>

#include "packetParser.h"
#include "roverConfig.h"

#ifdef BOARD_ADAFRUIT_nRF52832
#include <bluefruit.h>

// OTA DFU service
BLEDfu bledfu;

// Uart over BLE service
BLEUart bleuart;

rover_connect_callback_t mainConnectCallback;
rover_disconnect_callback_t mainDisconnectCallback;

// Packet buffer
extern uint8_t packetbuffer[];

// Function prototypes
void connect_callback(uint16_t conn_handle);
void disconnect_callback(uint16_t conn_handle, uint8_t reason);
uint8_t readPacket(BLEUart* ble_uart, uint16_t timeout);

void setupBoard() {
  pinMode(PIN_LED_FORWARD, OUTPUT);
  pinMode(PIN_LED_BACK, OUTPUT);
  pinMode(PIN_LED_LEFT, OUTPUT);
  pinMode(PIN_LED_RIGHT, OUTPUT);

#ifdef DEBUG
  SERIAL_PORT_CONSOLE.begin(SERIAL_BAUD_CONSOLE);
  while (!SERIAL_PORT_CONSOLE) delay(10);  // for nrf52840 with native usb
  DEBUG_PRINTLN(F("Adafruit Bluefruit52 Rover Simulator"));
  DEBUG_PRINTLN(F("-------------------------------------------"));
#endif
}

void startBluetooth() {
  // Config the peripheral connection with maximum bandwidth
  // more SRAM required by SoftDevice
  // Note: All config***() function must be called before begin()
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX);

  Bluefruit.begin();
  Bluefruit.setTxPower(4);  // Check bluefruit.h for supported values
  Bluefruit.setName(PERIPHERAL_NAME);

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

/**************************************************************************/
/*!
    @brief  Waits for incoming data and parses it
*/
/**************************************************************************/
uint8_t readPacket(BLEUart* ble_uart, uint16_t timeout) {
  uint16_t origtimeout = timeout, replyidx = 0;

  memset(packetbuffer, 0, READ_BUFSIZE);

  while (timeout--) {
    if (replyidx >= 20) break;
    if (((packetbuffer[1] == RX_STOP) && (replyidx == RX_STOP_LEN)) ||
        ((packetbuffer[1] == RX_CONTROL) && (replyidx == RX_CONTROL_LEN)) ||
        ((packetbuffer[1] == RX_KEY) && (replyidx == RX_KEY_LEN)) ||
        ((packetbuffer[1] == RX_SPEED_SET) && (replyidx == RX_SPEED_SET_LEN)))
      break;

    while (ble_uart->available()) {
      char c = ble_uart->read();
      if (c == '!') {
        replyidx = 0;
      }
      packetbuffer[replyidx] = c;
      replyidx++;
      timeout = origtimeout;
    }

    if (timeout == 0) break;
    delay(1);
  }

  packetbuffer[replyidx] = 0;  // null term

  if (!replyidx)  // no data or timeout
    return 0;
  if (packetbuffer[0] != '!')  // doesn't start with '!' packet beginning
    return 0;

  // check checksum!
  uint8_t xsum = 0;
  uint8_t checksum = packetbuffer[replyidx - 1];

  for (uint8_t i = 0; i < replyidx - 1; i++) {
    xsum += packetbuffer[i];
  }
  xsum = ~xsum;

  // Throw an error message if the checksum's don't match
  if (xsum != checksum) {
    DEBUG_PRINT("Checksum mismatch in packet : ");
    printHex(packetbuffer, replyidx + 1);
    return 0;
  }

  // checksum passed!
  return replyidx;
}

#endif
