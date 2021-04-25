/*
  RoverDriverArduino
  Arduino software for the CSA Rover Wheel Prototype
  MECH 462 Team 07

  Created in February 2021, Angelo L
*/
#include <Arduino.h>
#include <JrkG2.h>
#include <Wire.h>

#include "multiChannelRelay.h"
#include "packetParser.h"
#include "roverConfig.h"
#include "roverdriverarduino.h"

// Last transmission timers
unsigned long _last_realtime_TX;
unsigned long _last_quick_TX;
unsigned long _last_slow_TX;

uint8_t _mode;       // Device operating mode
uint8_t _speed = 0;  // Motor speed
bool b_forward, b_reverse, b_left, b_right;
int _right_target = 2048;
int _left_target = 2048;

// Motor controllers
JrkG2I2C jrkFR(I2C_JRK_FRONT_RIGHT);
JrkG2I2C jrkFL(I2C_JRK_FRONT_LEFT);
JrkG2I2C jrkRR(I2C_JRK_REAR_RIGHT);
JrkG2I2C jrkRL(I2C_JRK_REAR_LEFT);

/* Buffer to hold incoming characters */
uint8_t packetbuffer[READ_BUFSIZE + 1];

void setup() {
  setupBoard();
  DEBUG_PRINTLN(F("Board setup"));
  // Set up I2C.
  Wire.begin();

  setConnectCallback(connect_callback_main);
  setDisconnectCallback(disconnect_callback_main);
#ifdef BOARD_ARDUINO_NANO33BLE
  // nano33ble uses callbacks for rx and not polling
  setRXCallback(handleRX);
#endif
  DEBUG_PRINTLN(F("Callbacks set"));
  startBluetooth();
  DEBUG_PRINTLN(F("Bluetooth started"));
  setup_relay();
  DEBUG_PRINTLN(F("Relays set"));
  setMode(MODE_IDLE);
  DEBUG_PRINTLN(F("Mode set"));
  randomSeed(analogRead(0));  // Get random noise for unconnected analog pin
}

void loop() {
  // Wait for new data to arrive
  int8_t len = getIncoming();
  if (len != 0) {
    // Process incoming message
    handleRX(len);
  }

  if (_mode == MODE_CONNECTED || _mode == MODE_CONTROLLED) {
    // Send updates if rover is connected to controller
    if ((millis() - _last_realtime_TX) > INTERVAL_REALTIME) {
      DEBUG_PRINT(F("REALTIME: "));
      // Get/send highest frequency data (ex. motor controller state)

      // Send IMU data
      uint8_t buf_imu[13];
#ifdef USE_SIMULATED_DATA
      buf_imu[0] = TX_ACCEL;
      float x, y, z;
      x = round(random(100));
      y = round(random(100));
      z = round(random(100));
      memcpy(buf_imu + 1, &x, 4);
      memcpy(buf_imu + 5, &y, 4);
      memcpy(buf_imu + 9, &z, 4);
      sendMessage(buf_imu, 13);

      buf_imu[0] = TX_GYRO;
      x = round(random(100));
      y = round(random(100));
      z = round(random(100));
      memcpy(buf_imu + 1, &x, 4);
      memcpy(buf_imu + 5, &y, 4);
      memcpy(buf_imu + 9, &z, 4);
      sendMessage(buf_imu, 13);

      buf_imu[0] = TX_MAGNET;
      x = round(random(100));
      y = round(random(100));
      z = round(random(100));
      memcpy(buf_imu + 1, &x, 4);
      memcpy(buf_imu + 5, &y, 4);
      memcpy(buf_imu + 9, &z, 4);
      sendMessage(buf_imu, 13);
#else
      getAccelString(buf_imu);
      sendMessage(buf_imu, 13);
      getGyroString(buf_imu);
      sendMessage(buf_imu, 13);
      getFieldString(buf_imu);
      sendMessage(buf_imu, 13);
#endif

      // Send JRK Statuses
      uint8_t buf_jrk[15];
      buf_jrk[0] = TX_CONTROLLER_FR;
      getJRKStatus(buf_jrk + 1, jrkFR);
      sendMessage(buf_jrk, 15);

      buf_jrk[0] = TX_CONTROLLER_FL;
      getJRKStatus(buf_jrk + 1, jrkFL);
      sendMessage(buf_jrk, 15);

      buf_jrk[0] = TX_CONTROLLER_RR;
      getJRKStatus(buf_jrk + 1, jrkRR);
      sendMessage(buf_jrk, 15);

      buf_jrk[0] = TX_CONTROLLER_RL;
      getJRKStatus(buf_jrk + 1, jrkRL);
      sendMessage(buf_jrk, 15);

      _last_realtime_TX = millis();
      DEBUG_PRINTLN(F("OK"));
    }

    if ((millis() - _last_quick_TX) > INTERVAL_QUICK) {
      DEBUG_PRINT(F("QUICK: "));
      // Get/send medium frequency data (ex. mode)
      _last_quick_TX = millis();

      // Send device mode
      uint8_t buf_mode[2] = {TX_MODE, _mode};
      sendMessage(buf_mode, 2);

      // Send rover speed cap
      uint8_t buf_speed[2] = {TX_SPEED, _speed};
      sendMessage(buf_speed, 2);
      DEBUG_PRINTLN(F("OK"));
    }

    if ((millis() - _last_slow_TX) > INTERVAL_SLOW) {
      DEBUG_PRINT(F("SLOW: "));
      // Get/send lowest frequency data (ex. device voltage)
      _last_slow_TX = millis();

      // Send battery voltage
      uint8_t buf_voltage[5];
      buf_voltage[0] = TX_VOLTAGE;
#ifdef USE_SIMULATED_DATA
      float voltage = 14.1;
#else
      float voltage =
          (map(analogRead(PIN_A_VOLTAGE), 0, 4095, 0, 1853)) / 100.0;
#endif
      // Save characters to buffer
      memcpy(buf_voltage + 1, &voltage, 4);
      sendMessage(buf_voltage, 5);

      // Send RSSI (signal strength)
#ifdef USE_SIMULATED_DATA
      int8_t rssi = -1 * round(random(100));
      uint8_t buf_rssi[2] = {TX_RSSI, 0};
      memcpy(buf_rssi + 1, &rssi, 1);
#else
      uint8_t buf_rssi[2] = {TX_RSSI, getRssi()};
#endif
      sendMessage(buf_rssi, 2);

      // Send device on time
      unsigned long time = millis();
      uint8_t buf_millis[5];
      buf_millis[0] = TX_MILLIS;
      memcpy(buf_millis + 1, &time, 4);
      sendMessage(buf_millis, 5);

      DEBUG_PRINTLN(F("OK"));
    }
  }

  if (_mode == MODE_CONTROLLED) {
    jrkFR.setTarget(_right_target);
    jrkRR.setTarget(_right_target);
    jrkFL.setTarget(_left_target);
    jrkRL.setTarget(_left_target);
  }
}

void getJRKStatus(uint8_t* buf, JrkG2I2C jrk) {
  uint16_t returned;
  jrk.getVariables(0x12, 2, buf + 1);  // Error Halting
  returned = jrk.getVinVoltage();
  memcpy(buf + 3, &returned, 2);
  returned = jrk.getCurrent();
  memcpy(buf + 5, &returned, 2);
  returned = jrk.getDutyCycleTarget();
  memcpy(buf + 7, &returned, 2);
  returned = jrk.getDutyCycle();
  memcpy(buf + 9, &returned, 2);
  returned = jrk.getFeedback();
  memcpy(buf + 11, &returned, 2);
  jrk.getVariables(0x1F, 1, buf + 13);
  int8_t status = jrk.getLastError();
  if (status == 0) {
    status = 1;
  } else {
    status = -1;
  }
  memcpy(buf, &status, 1);
}

const int kOutLow = 1568;
const int kOutHigh = 2528;

void calculateMotorTargets() {
  float rMotorTarget = 0.0;
  if (b_forward) rMotorTarget = rMotorTarget + 1.0;
  if (b_reverse) rMotorTarget = rMotorTarget - 1.0;
  if (b_left) rMotorTarget = rMotorTarget + TURN_SPEED;
  if (b_right) rMotorTarget = rMotorTarget - TURN_SPEED;
  rMotorTarget = constrain(rMotorTarget, -1, 1);
  rMotorTarget = rMotorTarget * _speed;
  // map -10 to 10 to 0, 4095
  rMotorTarget =
      (rMotorTarget - (-10.0)) * ((kOutHigh) - (kOutLow)) / ((10.0) - (-10.0)) +
      kOutLow;
  _right_target = round(rMotorTarget);

  float lMotorTarget = 0.0;
  if (b_forward) lMotorTarget = lMotorTarget + 1.0;
  if (b_reverse) lMotorTarget = lMotorTarget - 1.0;
  if (b_left) lMotorTarget = lMotorTarget - TURN_SPEED;
  if (b_right) lMotorTarget = lMotorTarget + TURN_SPEED;
  lMotorTarget = constrain(lMotorTarget, -1, 1);
  lMotorTarget = lMotorTarget * _speed;
  // map -10 to 10 to 0, 4095
  lMotorTarget =
      (lMotorTarget - (-10.0)) * ((kOutHigh) - (kOutLow)) / ((10.0) - (-10.0)) +
      kOutLow;
  _left_target = round(lMotorTarget);
}

void handleRX(uint8_t len) {
  printHex(packetbuffer, len);
  switch (packetbuffer[1]) {
    case RX_STOP: {
      setMode(MODE_CONNECTED);
      _speed = 0;

      uint8_t buf_stop[2] = {TX_MODE, _mode};
      sendMessage(buf_stop, 2);
      break;
    }
    case RX_CONTROL: {
      setMode(MODE_CONTROLLED);
      _speed = 1;

      uint8_t buf_control[2] = {TX_MODE, _mode};
      sendMessage(buf_control, 2);
      break;
    }
    case RX_KEY: {  // Buttons
      if (_mode == MODE_CONTROLLED) {
        uint8_t buttnum = packetbuffer[2] - '0';
        boolean pressed = packetbuffer[3] - '0';
        // DEBUG_PRINT(F("Button "));
        // DEBUG_PRINT(buttnum);
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
              digitalWrite(PIN_LED_FORWARD, HIGH);
              b_forward = true;
              break;
            }
            case KEY_REVERSE: {
              digitalWrite(PIN_LED_BACK, HIGH);
              b_reverse = true;
              break;
            }
            case KEY_LEFT: {
              digitalWrite(PIN_LED_LEFT, HIGH);
              b_left = true;
              break;
            }
            case KEY_RIGHT: {
              digitalWrite(PIN_LED_RIGHT, HIGH);
              b_right = true;
              break;
            }
          }
        } else {
          switch (buttnum) {
            case KEY_FORWARD: {
              digitalWrite(PIN_LED_FORWARD, LOW);
              b_forward = false;
              break;
            }
            case KEY_REVERSE: {
              digitalWrite(PIN_LED_BACK, LOW);
              b_reverse = false;
              break;
            }
            case KEY_LEFT: {
              digitalWrite(PIN_LED_LEFT, LOW);
              b_left = false;
              break;
            }
            case KEY_RIGHT: {
              digitalWrite(PIN_LED_RIGHT, LOW);
              b_right = false;
              break;
            }
          }
        }
        calculateMotorTargets();
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
    case RX_CONTROLLER_FR: {
      jrkFR.getErrorFlagsHalting();
      break;
    }
    case RX_CONTROLLER_FL: {
      jrkFL.getErrorFlagsHalting();
      break;
    }
    case RX_CONTROLLER_RR: {
      jrkRR.getErrorFlagsHalting();
      break;
    }
    case RX_CONTROLLER_RL: {
      jrkRL.getErrorFlagsHalting();
      break;
    }
    default:
      DEBUG_PRINTLN(F("Can't match message"));
      break;
  }
}

void setMode(uint8_t mode) {
  DEBUG_PRINT(F("Setting mode "));
  DEBUG_PRINT(mode);

  // Don't go into MODE_CONTROLLED if the system voltage is less than 13.2 V
  if (mode == MODE_CONTROLLED &&
      (map(analogRead(PIN_A_VOLTAGE), 0, 4095, 0, 1853)) / 100.0 < 13.2)
    return;

  switch (mode) {
    case MODE_IDLE: {
      digitalWrite(PIN_LED_MODE_0, HIGH);
      digitalWrite(PIN_LED_MODE_1, LOW);
      digitalWrite(PIN_LED_MODE_2, LOW);
      break;
    }
    case MODE_CONNECTED: {
      digitalWrite(PIN_LED_MODE_0, LOW);
      digitalWrite(PIN_LED_MODE_1, HIGH);
      digitalWrite(PIN_LED_MODE_2, LOW);
      break;
    }
    case MODE_CONTROLLED: {
      digitalWrite(PIN_LED_MODE_0, LOW);
      digitalWrite(PIN_LED_MODE_1, LOW);
      digitalWrite(PIN_LED_MODE_2, HIGH);
      break;
    }
  }
  relay_setMode(mode);

  // Stop all motors if entering a non-controlled mode
  if (mode != MODE_CONTROLLED) {
    jrkFR.stopMotor();
    jrkFL.stopMotor();
    jrkRR.stopMotor();
    jrkRL.stopMotor();
    _right_target = 2048;
    _left_target = 2048;
  }

  _mode = mode;
  DEBUG_PRINTLN(F(" OK"));
}

void connect_callback_main(char* central_name) {
  DEBUG_PRINT(F("Connected to "));
  DEBUG_PRINTLN(central_name);

  setMode(MODE_CONNECTED);
}

/**
 * Callback invoked when a connection is dropped
 * @param reason is a BLE_HCI_STATUS_CODE which can be found in ble_hci.h
 */
void disconnect_callback_main(uint8_t reason) {
  DEBUG_PRINT(F("Disconnected, reason = 0x"));
  DEBUG_PRINTLN(reason);
  DEBUG_PRINTLN(F("Advertising!"));

  setMode(MODE_IDLE);
  _speed = 0;
}
