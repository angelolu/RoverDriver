#ifndef _MULTICHANNELRELAY_H
#define _MULTICHANNELRELAY_H

#define RELAY_I2C_ADDR		0x11

#define CHANNEL1_BIT  0x01
#define CHANNEL2_BIT  0x02
#define CHANNEL3_BIT  0x04
#define CHANNEL4_BIT  0x08

#define CMD_CHANNEL_CTRL					0x10

void setup_relay();
void relay_turnOff();
void relay_setMode(int8_t mode);
void relay_turnOnChannel(uint8_t channel);
#endif