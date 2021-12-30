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
- [ ] Server.js should process data further
- [ ] Display the data on frontend
- [ ] Look into neural networks for posture recognition
- [ ] Improve webserver data handling
- [ ] Smooth values from sensors
- [ ] Use multiple axis
## Architecture

![Architecture](/Architecture.jpg)


## Folder Structure

- ESP8266/Client -> The sketch for the ESP8266 which have the MPU6050 connected, connect to the AP and send the sensors data
- ESP8266/Server -> The sketch for the ESP8266 which opens the wifi AP and listens for the websocket data
- Server -> The node.js server which get the data from the serial port connected to the Access Point ESP8266
- src -> The parcel webserver files
