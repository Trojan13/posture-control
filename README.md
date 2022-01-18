# Posture Control
A project within the module "ubiqutous computing". The aim of the project is to create a system that controls the posture of a user when lifting heavy objects and gives suggestions for improvement.

## Sub-Goals

- Visualize back posture
- Check if person is lifing something
- Recognize a bad posture
- Alert user by beeping or vibrating
 
## Todo

- [x] Solder ESP8266 #1
- [x] Solder ESP8266 #2
- [x] Test FSR
- [x] Solder ESP8266 with FSR #3
- [x] make client.ino for fsr
- [x] Make client.ino work
- [x] Make server.ino work
- [x] Test with two clients
- [x] Test with three clients
- [x] Make server.ino work with webserver
- [x] Add status display for clients
- [x] Add beeper to foot https://www.arduino.cc/en/Tutorial/BuiltInExamples/toneMelody
- [x] Add beeper to back
- [x] Request status on boot for clients
- [x] Add function to send data to clients
- [ ] Server.js should process data further
- [o] Calibrate MPU6050 Sensors
- [o] Calculate right angles from mpu data
- [ ] Display the data on frontend
- [x] Look into neural networks for posture recognition
- [ ] Improve webserver data handling
- [o] Smooth values from sensors
- [o] Use multiple axis
- [ ] Find better method to time the training
- [ ] Restrict training to 20 lines per file
- [ ] Fixed null error in training

## Architecture

![Architecture](/Architecture.jpg)


## Folder Structure

- ESP8266/Client -> The sketch for the ESP8266 which have the MPU6050 connected, connect to the AP and send the sensors data
- ESP8266/Server -> The sketch for the ESP8266 which opens the wifi AP and listens for the websocket data
- Server -> The node.js server which get the data from the serial port connected to the Access Point ESP8266
- src -> The parcel webserver files

## Screenshot
Screenshot of the current version of the frontend
![Screenshot](/screenshot.png)
