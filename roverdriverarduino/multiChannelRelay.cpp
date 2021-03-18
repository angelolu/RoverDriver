#include <Arduino.h>
#include <Wire.h>
#include "multiChannelRelay.h"
#include "roverConfig.h"

int channel_state;  // Value to save channel state

void setup_relay() {
  Wire.begin();
  channel_state = 0;
}

void relay_turnOff() {
  channel_state &= ~(1 << (CHANNEL1_BIT - 1));
  channel_state &= ~(1 << (CHANNEL2_BIT - 1));
  channel_state &= ~(1 << (CHANNEL3_BIT - 1));
  channel_state &= ~(1 << (CHANNEL4_BIT - 1));

  Wire.beginTransmission(RELAY_I2C_ADDR);
  Wire.write(CMD_CHANNEL_CTRL);
  Wire.write(channel_state);
  Wire.endTransmission();
}

void relay_setMode(int8_t mode) {
  channel_state &= ~(1 << (CHANNEL1_BIT - 1));
  channel_state &= ~(1 << (CHANNEL2_BIT - 1));
  channel_state &= ~(1 << (CHANNEL3_BIT - 1));
  channel_state &= ~(1 << (CHANNEL4_BIT - 1));

  switch (mode) {
    case (MODE_IDLE): {
      channel_state |= (1 << (CHANNEL1_BIT - 1));
      break;
    }
    case (MODE_CONNECTED): {
      channel_state |= (1 << (CHANNEL2_BIT - 1));
      break;
    }
    case (MODE_CONTROLLED): {
      channel_state |= (1 << (CHANNEL3_BIT - 1));
      break;
    }
  }

  Wire.beginTransmission(RELAY_I2C_ADDR);
  Wire.write(CMD_CHANNEL_CTRL);
  Wire.write(channel_state);
  Wire.endTransmission();
}

void relay_turnOnChannel(uint8_t channel){
    channel_state |= (1 << (channel - 1));

    Wire.beginTransmission(RELAY_I2C_ADDR);
    Wire.write(CMD_CHANNEL_CTRL);
    Wire.write(channel_state);
    Wire.endTransmission();
}