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
