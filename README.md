This repository contains the code for the CSA Rover Wheel Prototype developed for MECH 462 by Team 07.

Additional details about the BLE communication format between the rover prototype and the controller is documented in the repository wiki.

## roverdriverweb ('the controller')

Web app that can be used to display rover status, control the speed and movement of the motors and log sensor data wirelessly.

The app is uses React JS and the Web Bluetooth API. This API is an experimental web technology and is available on Chrome, Opera and the new Microsoft Edge on desktop and mobile as well as Samsung Internet on mobile. See more compatibility details [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API).

The app meets requirements as a [Progressive Web App](https://web.dev/progressive-web-apps/) to work offline if installed as an app via the browser prompts.

### Automatic deploy

When a commit is made or a pull request is approved for the main branch, a GitHub action will start building a production version of the web app. If successful, the new app will be deployed to [angelolu.github.io/roverdriver/](angelolu.github.io/roverdriver/)

### Getting started

After cloning the repository:

* Make sure you have a recent version of [Node.js](https://nodejs.org/en/) installed.
* Enter the directory: `cd roverdriverweb`
* Install dependencies: `npm i`
* Run locally: `npm start`

## roverdriverarduino ('the rover')

This folder contains the code for the Arduino-compatible microcontroller on the prototype. It is responsible for implementing the Bluetooth communication logic described by the repository wiki and relaying requests to the various peripherals, including the stack lights and the motor drivers.

The code was designed with the Nordic's nRF52 SoC series in mind, using the Bluefruit library on Adafruit boards and the ArduinoBLE library on Arduino boards as their underlying Arduino core and OSes are different.