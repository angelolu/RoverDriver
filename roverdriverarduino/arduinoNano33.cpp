/*
  Board driver for the Arduino NANO 33 BLE

  Created in February 2021, Angelo L
*/

#include <Arduino.h>

#include "packetParser.h"
#include "roverConfig.h"

#ifdef BOARD_ARDUINO_NANO33BLE
#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>

const char* uuidOfService = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const char* uuidOfRxChar = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const char* uuidOfTxChar = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

extern "C" void NVIC_SystemReset();

// Packet buffer
extern uint8_t packetbuffer[];

rover_connect_callback_t mainConnectCallback;
rover_disconnect_callback_t mainDisconnectCallback;
rover_RX_callback_t mainRXCallback;

// Setup the incoming data characteristic (RX).
const int RX_BUFFER_SIZE = 256;
bool RX_BUFFER_FIXED_LENGTH = false;
BLECharacteristic rxChar(uuidOfRxChar, BLEWriteWithoutResponse | BLEWrite,
                         RX_BUFFER_SIZE, RX_BUFFER_FIXED_LENGTH);
BLECharacteristic txChar(uuidOfTxChar, BLERead | BLENotify | BLEBroadcast,
                         RX_BUFFER_SIZE, RX_BUFFER_FIXED_LENGTH);

// Function prototypes
void connect_callback(uint16_t conn_handle);
void disconnect_callback(uint16_t conn_handle, uint8_t reason);
uint8_t readPacket(uint16_t timeout);
void connect_callback(BLEDevice central);
void disconnect_callback(BLEDevice central);
void onRxCharValueUpdate(BLEDevice central, BLECharacteristic characteristic);

void setupBoard() {
  pinMode(PIN_LED_FORWARD, OUTPUT);
  pinMode(PIN_LED_BACK, OUTPUT);
  pinMode(PIN_LED_LEFT, OUTPUT);
  pinMode(PIN_LED_RIGHT, OUTPUT);
  pinMode(PIN_LED_MODE_0, OUTPUT);
  pinMode(PIN_LED_MODE_1, OUTPUT);
  pinMode(PIN_LED_MODE_2, OUTPUT);

  analogReadResolution(12);

#ifdef DEBUG
  SERIAL_PORT_CONSOLE.begin(SERIAL_BAUD_CONSOLE);
  while (!SERIAL_PORT_CONSOLE)
    delay(10);  // Wait for serial port to become ready
  DEBUG_PRINTLN(F("Arduino NANO 33 BLE Rover"));
  DEBUG_PRINTLN(F("-------------------------------------------"));
#endif
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }
  Serial.print("Gyroscope sample rate = ");
  Serial.print(IMU.gyroscopeSampleRate());
  Serial.println(" Hz");
  Serial.print("Accelerometer sample rate = ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println(" Hz");
  Serial.print("Magnetic field sample rate = ");
  Serial.print(IMU.magneticFieldSampleRate());
  Serial.println(" Hz");
}

void startBluetooth() {
  // Start BLE.
  if (!BLE.begin()) {
    DEBUG_PRINTLN("starting BLE failed!");
    while (1)
      ;
  }

  // BLE Service
  BLEService uartService(uuidOfService);

  // Create BLE service and characteristics.
  BLE.setLocalName(PERIPHERAL_NAME);
  BLE.setAdvertisedService(uartService);
  uartService.addCharacteristic(rxChar);
  uartService.addCharacteristic(txChar);
  BLE.addService(uartService);

  // Bluetooth LE connection handlers.
  BLE.setEventHandler(BLEConnected, connect_callback);
  BLE.setEventHandler(BLEDisconnected, disconnect_callback);

  // Event driven reads.
  rxChar.setEventHandler(BLEWritten, onRxCharValueUpdate);

  // Begin advertising
  BLE.advertise();

  DEBUG_PRINTLN("Peripheral advertising info: ");
  DEBUG_PRINT("Name: ");
  DEBUG_PRINTLN(PERIPHERAL_NAME);
  DEBUG_PRINT("MAC: ");
  DEBUG_PRINTLN(BLE.address());
  DEBUG_PRINT("Service UUID: ");
  DEBUG_PRINTLN(uartService.uuid());
  DEBUG_PRINT("rxCharacteristic UUID: ");
  DEBUG_PRINTLN(uuidOfRxChar);
  DEBUG_PRINT("txCharacteristics UUID: ");
  DEBUG_PRINTLN(uuidOfTxChar);

  DEBUG_PRINTLN("Bluetooth device active, waiting for connections...");
}

void onRxCharValueUpdate(BLEDevice central, BLECharacteristic characteristic) {
  // central wrote new value to characteristic, update LED
  DEBUG_PRINT("Characteristic event, read: ");
  int bytes = rxChar.readValue(packetbuffer, READ_BUFSIZE);

  uint8_t xsum = 0;
  uint8_t checksum = packetbuffer[bytes - 1];

  for (uint8_t i = 0; i < bytes - 1; i++) {
    xsum += packetbuffer[i];
  }
  xsum = ~xsum;

  // Throw an error message if the checksum's don't match
  if (xsum != checksum) {
    DEBUG_PRINT("Checksum mismatch in packet : ");
    printHex(packetbuffer, bytes + 1);
    return;
  }

  if (mainRXCallback) mainRXCallback(bytes);
}

void setConnectCallback(rover_connect_callback_t connect_callback) {
  mainConnectCallback = connect_callback;
}

void setDisconnectCallback(rover_disconnect_callback_t disconnect_callback) {
  mainDisconnectCallback = disconnect_callback;
}

void setRXCallback(rover_RX_callback_t RX_callback) {
  mainRXCallback = RX_callback;
}

void connect_callback(BLEDevice central) {
  DEBUG_PRINT("Connected event, central: ");
  DEBUG_PRINTLN(central.address());
  // Start monitoring rssi of this connection

  // Report back if a connection callback was set
  if (mainConnectCallback) {
    if (central.hasLocalName()) {
      char localname[50];
      central.localName().toCharArray(localname, 50);
      mainConnectCallback(localname);
    } else {
      char address[50];
      central.address().toCharArray(address, 50);
      mainConnectCallback(address);
    }
  }
}

/**
 * Callback invoked when a connection is dropped
 * @param conn_handle connection where this event happens
 */
void disconnect_callback(BLEDevice central) {
  DEBUG_PRINT("Disconnected event, central: ");
  DEBUG_PRINTLN(central.address());
  if (mainDisconnectCallback) mainDisconnectCallback(0);
    // Workaround for instability after disconnecting/connecting multiple times
  NVIC_SystemReset(); // Soft reset system
}

uint8_t getIncoming() {
  BLEDevice central = BLE.central();
  return 0;
}

int8_t getRssi() {
  BLEDevice central = BLE.central();
  if (central) return central.rssi();
  return -1;
}

void sendMessage(uint8_t* message, int message_len) {
  // DEBUG_PRINT("SENDING ");
  // printHex(message, message_len);
  BLEDevice central = BLE.central();
  if (central) txChar.writeValue(message, message_len);
}

/**************************************************************************/
/*!
    @brief  Waits for incoming data and parses it
*/
/**************************************************************************/
uint8_t readPacket(uint16_t timeout) {
  uint16_t origtimeout = timeout, replyidx = 0;

  memset(packetbuffer, 0, READ_BUFSIZE);
  DEBUG_PRINT("READING ");
  DEBUG_PRINTLN(millis() / 1000);
  while (timeout--) {
    if (replyidx >= 20) break;
    if (((packetbuffer[1] == RX_STOP) && (replyidx == RX_STOP_LEN)) ||
        ((packetbuffer[1] == RX_CONTROL) && (replyidx == RX_CONTROL_LEN)) ||
        ((packetbuffer[1] == RX_KEY) && (replyidx == RX_KEY_LEN)) ||
        ((packetbuffer[1] == RX_SPEED_SET) && (replyidx == RX_SPEED_SET_LEN)))
      break;
    int bytes = rxChar.readValue(packetbuffer + replyidx, READ_BUFSIZE);

    if (bytes > 0) {
      timeout = origtimeout;
      replyidx = replyidx + bytes;
      DEBUG_PRINT(replyidx);
      DEBUG_PRINTLN(": read some stuff!");
    }
    if (replyidx > 0 && packetbuffer[0] != '!') {
      DEBUG_PRINTLN("Back to start");
      replyidx = 0;
    }
    if (timeout == 0) break;
    delay(1);
  }
  // DEBUG_PRINTLN("READ DONE");
  packetbuffer[replyidx] = 0;  // null term
  if (!replyidx)               // no data or timeout
    return 0;
  if (packetbuffer[0] != '!')  // doesn't start with '!' packet beginning
    return 0;
  DEBUG_PRINTLN("CHECKING CHECKSUM");
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

void getGyroString(uint8_t* buf_imu) {
  buf_imu[0] = TX_GYRO;
  float x, y, z;
  if (IMU.gyroscopeAvailable()) {
    IMU.readGyroscope(x, y, z);
    memcpy(buf_imu + 1, &x, 4);
    memcpy(buf_imu + 5, &y, 4);
    memcpy(buf_imu + 9, &z, 4);
  }
}

void getAccelString(uint8_t* buf_imu) {
  buf_imu[0] = TX_ACCEL;
  float x, y, z;
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
    // Convert from G to m/s^2
    x = x * 9.8066;
    y = y * 9.8066;
    z = z * 9.8066;
    memcpy(buf_imu + 1, &x, 4);
    memcpy(buf_imu + 5, &y, 4);
    memcpy(buf_imu + 9, &z, 4);
  }
}

void getFieldString(uint8_t* buf_imu) {
  buf_imu[0] = TX_MAGNET;
  float x, y, z;
  if (IMU.magneticFieldAvailable()) {
    IMU.readMagneticField(x, y, z);
    memcpy(buf_imu + 1, &x, 4);
    memcpy(buf_imu + 5, &y, 4);
    memcpy(buf_imu + 9, &z, 4);
  }
}
#endif