/*
  RoverDriverArduino
  Arduino software for the CSA Rover Wheel Prototype
  MECH 462 Team 07

  Created in February 2021, Angelo L
*/

#include "roverdriverarduino.h"

// Packet buffer
extern uint8_t packetbuffer[];

// Last transmission timers
unsigned long _last_realtime_TX;
unsigned long _last_quick_TX;
unsigned long _last_slow_TX;

uint8_t _mode = MODE_IDLE;  // Device operating mode
uint8_t _speed = 0;         // Motor speed

void setup() {
  setupBoard();
  setConnectCallback(connect_callback_main);
  setDisconnectCallback(disconnect_callback_main);
  startBluetooth();

  randomSeed(analogRead(0));  // Get random noise for unconnected analog pin
}

void loop() {
  // Wait for new data to arrive
  uint8_t len = getIncoming();
  if (len != 0) {
    // Process incoming message
    handleRX(len);
  }
  if (_mode == MODE_CONNECTED || _mode == MODE_CONTROLLED) {
    // Send updates if rover is connected to controller
    if ((millis() - _last_realtime_TX) > INTERVAL_REALTIME) {
      // Get/send highest frequency data (ex. motor controller state)
      _last_realtime_TX = millis();
    }

    if ((millis() - _last_quick_TX) > INTERVAL_QUICK) {
      // Get/send medium frequency data (ex. IMU readings)
      _last_quick_TX = millis();

// Send IMU data
#ifdef USE_SIMULATED_DATA
      uint8_t buf_imu[30];
      buf_imu[0] = TX_ACCEL;
      String accelData = "";
      accelData = accelData + round(random(100)) + ';' + round(random(100)) +
                  ';' + round(random(100));
      accelData.getBytes(buf_imu + 1, accelData.length() + 1);
      sendMessage(buf_imu, accelData.length() + 1);
      buf_imu[0] = TX_GYRO;
      String gyroData = "";
      gyroData = gyroData + round(random(100)) + ';' + round(random(100)) +
                 ';' + round(random(100));
      gyroData.getBytes(buf_imu + 1, gyroData.length() + 1);
      sendMessage(buf_imu, gyroData.length() + 1);

      buf_imu[0] = TX_MAGNET;
      String magnetData = "";
      magnetData = magnetData + round(random(100)) + ';' + round(random(100)) +
                   ';' + round(random(100));
      magnetData.getBytes(buf_imu + 1, magnetData.length() + 1);
      sendMessage(buf_imu, magnetData.length() + 1);
#else
#endif

      // Send device mode
      uint8_t buf_mode[2] = {TX_MODE, _mode};
      sendMessage(buf_mode, 2);

      // Send rover speed cap
      uint8_t buf_speed[2] = {TX_SPEED, _speed};
      sendMessage(buf_speed, 2);
    }
    if ((millis() - _last_slow_TX) > INTERVAL_SLOW) {
      // Get/send lowest frequency data (ex. device voltage)
      _last_slow_TX = millis();

      // Send battery voltage
      uint8_t buf_voltage[8];
      buf_voltage[0] = TX_VOLTAGE;
#ifdef USE_SIMULATED_DATA
      String voltage = "14.3";
#else
#endif
      // Save characters to buffer
      voltage.getBytes(buf_voltage + 1, 7);
      sendMessage(buf_voltage, voltage.length() + 1);

      // Send RSSI (signal strength)
      uint8_t buf_rssi[2] = {TX_RSSI, getRssi()};
      sendMessage(buf_rssi, 2);

      // Send device on time
      unsigned long time = millis();
      uint8_t buf_millis[5];
      buf_millis[0] = TX_MILLIS;
      memcpy(buf_millis + 1, &time, 4);
      sendMessage(buf_millis, 5);
    }
  }
}

void handleRX(uint8_t len) {
  printHex(packetbuffer, len);
  switch (packetbuffer[1]) {
    case RX_STOP: {
      _mode = MODE_CONNECTED;
      _speed = 0;

      uint8_t buf_stop[2] = {TX_MODE, _mode};
      sendMessage(buf_stop, 2);
      break;
    }
    case RX_CONTROL: {
      _mode = MODE_CONTROLLED;
      _speed = 1;

      uint8_t buf_control[2] = {TX_MODE, _mode};
      sendMessage(buf_control, 2);
      break;
    }
    case RX_KEY: {  // Buttons
      if (_mode == MODE_CONTROLLED) {
        uint8_t buttnum = packetbuffer[2] - '0';
        boolean pressed = packetbuffer[3] - '0';
        DEBUG_PRINT(F("Button "));
        DEBUG_PRINT(buttnum);
        if (pressed) {
          switch (buttnum) {
            case KEY_INCREASE: {
              if (_speed < 10) _speed++;

              uint8_t buf_speed[2] = {TX_SPEED, _speed};
              sendMessage(buf_speed, 2);
              break;
            }
            case KEY_DECREASE: {
              if (_speed > 1) _speed--;

              uint8_t buf_speed[2] = {TX_SPEED, _speed};
              sendMessage(buf_speed, 2);
              break;
            }
            case KEY_FORWARD: {
              digitalWrite(PIN_LED_FORWARD, LOW);
              break;
            }
            case KEY_REVERSE: {
              digitalWrite(PIN_LED_BACK, LOW);
              break;
            }
            case KEY_LEFT: {
              digitalWrite(PIN_LED_LEFT, LOW);
              break;
            }
            case KEY_RIGHT: {
              digitalWrite(PIN_LED_RIGHT, LOW);
              break;
            }
          }
        } else {
          switch (buttnum) {
            case KEY_FORWARD: {
              digitalWrite(PIN_LED_FORWARD, HIGH);
              break;
            }
            case KEY_REVERSE: {
              digitalWrite(PIN_LED_BACK, HIGH);
              break;
            }
            case KEY_LEFT: {
              digitalWrite(PIN_LED_LEFT, HIGH);
              break;
            }
            case KEY_RIGHT: {
              digitalWrite(PIN_LED_RIGHT, HIGH);
              break;
            }
          }
        }
      }
      break;
    }
    case RX_SPEED_SET: {
      if (_mode == MODE_CONTROLLED) {
        _speed = parseint(packetbuffer + 2);
        DEBUG_PRINTLN(_speed);
        uint8_t buf_speed[2] = {TX_SPEED, _speed};
        sendMessage(buf_speed, 2);
        break;
      }
    }
    default:
      DEBUG_PRINTLN(F("Can't match message"));
      break;
  }
}

void connect_callback_main(char *central_name) {
  DEBUG_PRINT(F("Connected to "));
  DEBUG_PRINTLN(central_name);

  _mode = MODE_CONNECTED;
}

/**
 * Callback invoked when a connection is dropped
 * @param reason is a BLE_HCI_STATUS_CODE which can be found in ble_hci.h
 */
void disconnect_callback_main(uint8_t reason) {
  DEBUG_PRINT(F("Disconnected, reason = 0x"));
  DEBUG_PRINT(reason);
  DEBUG_PRINTLN(F("Advertising!"));

  _mode = MODE_IDLE;
  _speed = 0;
}
