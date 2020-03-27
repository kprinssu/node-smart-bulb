# node-bulb-api
Allows you to control a Revogi Smart Bulb on OSX or Linux. 

This project was hacked together over a weekend and does not represent my programming ability. 
As such, it is a proof of concept project to demonstrate that NodeJS can be used to control BLE devices. 

# Requirements
* Linux or OSX (Windows is currently not supported)
* Bluetooth Low Energy (most BT4.0 devices are capable of BLE)
* NodeJS with NPM

# Installation
1. Install the depencies using NPM:
````
npm install
````
2. Run node-bulb-api by 
````
node server.js
````
3. Access the web interface on:
````
http://<your ip here>:3000
````
# Homebridge

API for [homebridge-better-http-rgb](https://github.com/jnovack/homebridge-better-http-rgb).

Example for Homebridge config file.
````
{
  "accessory": "HTTP-RGB",
  "name": "MyBulb",
  "switch": {
    "status": "http://localhost:3000/api/homebridge/<Bulb ID>/status",
    "powerOn": "http://localhost:3000/api/homebridge/<Bulb ID>/status/1",
    "powerOff": "http://localhost:3000/api/homebridge/<Bulb ID>/status/0"
  },
  "brightness": {
    "status": "http://localhost:3000/api/homebridge/<Bulb ID>/brightness",
    "url": "http://localhost:3000/api/homebridge/<Bulb ID>/brightness/%s"
  },
  "color": {
    "status": "http://localhost:3000/api/homebridge/<Bulb ID>/color",
    "url": "http://localhost:3000/api/homebridge/<Bulb ID>/color/%s",
    "brightness": true
  }
}
````
