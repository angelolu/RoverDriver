#include <Arduino.h>
#include <bluefruit.h>
#include <string.h>

#include "roverdriverarduino.h"

//    READ_BUFSIZE            Size of the read buffer for incoming packets
#define READ_BUFSIZE (20)

/* Buffer to hold incoming characters */
uint8_t packetbuffer[READ_BUFSIZE + 1];

/**************************************************************************/
/*!
    @brief  Casts the four bytes at the specified address to a float
*/
/**************************************************************************/
float parsefloat(uint8_t *buffer) {
  float f;
  memcpy(&f, buffer, 4);
  return f;
}

/**************************************************************************/
/*!
    @brief  Casts the buffer address to a string then converts it to a float
*/
/**************************************************************************/
int parseint(uint8_t *buffer) { return atoi((const char *)buffer); }

/**************************************************************************/
/*!
    @brief  Prints a hexadecimal value in plain characters
    @param  data      Pointer to the byte data
    @param  numBytes  Data length in bytes
*/
/**************************************************************************/
void printHex(const uint8_t *data, const uint32_t numBytes) {
  uint32_t szPos;
  for (szPos = 0; szPos < numBytes; szPos++) {
    DEBUG_PRINT(F("0x"));
    // Append leading 0 for small values
    if (data[szPos] <= 0xF) {
      DEBUG_PRINT(F("0"));
      DEBUG_PRINT2(data[szPos] & 0xf, HEX);
    } else {
      DEBUG_PRINT2(data[szPos] & 0xff, HEX);
    }
    // Add a trailing space if appropriate
    if ((numBytes > 1) && (szPos != numBytes - 1)) {
      DEBUG_PRINT(F(" "));
    }
  }
  DEBUG_PRINTLN();
}

/**************************************************************************/
/*!
    @brief  Waits for incoming data and parses it
*/
/**************************************************************************/
uint8_t readPacket(BLEUart *ble_uart, uint16_t timeout) {
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
