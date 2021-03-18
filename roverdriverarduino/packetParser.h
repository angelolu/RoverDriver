#ifndef _PACKETPARSER_H
#define _PACKETPARSER_H

/**************************************************************************/
/*!
    @brief  Casts the four bytes at the specified address to a float
*/
/**************************************************************************/
float parsefloat(uint8_t *buffer);

/**************************************************************************/
/*!
    @brief  Casts the buffer address to a string then converts it to a float
*/
/**************************************************************************/
int parseint(uint8_t *buffer);

/**************************************************************************/
/*!
    @brief  Prints a hexadecimal value in plain characters
    @param  data      Pointer to the byte data
    @param  numBytes  Data length in bytes
*/
/**************************************************************************/
void printHex(const uint8_t *data, const uint32_t numBytes);

#endif