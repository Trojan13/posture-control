# Posture Control
A project within the module "ubiqutous computing". The aim of the project is to create a system that controls the posture of a user when lifting heavy objects and gives suggestions for improvement.
https://youtu.be/2RV6aqpohyI

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
- [x] Calibrate MPU6050 Sensors
- [x] Calculate right angles from mpu data
- [ ] Display the data on frontend
- [x] Look into neural networks for posture recognition
- [ ] Improve webserver data handling
- [x] Smooth values from sensors
- [x] Use multiple axis
- [ ] Find better method to time the training
- [ ] Restrict training to 20 lines per file
- [ ] Fixed null error in training
- [ ] Visualize all raw data
- [ ] Use visualisations to process data further

## Architecture

![Architecture](/Architecture.jpg)


## Folder Structure

- ESP8266/Client -> The sketch for the ESP8266 which have the MPU6050 connected, connect to the AP and send the sensors data
- ESP8266/Server -> The sketch for the ESP8266 which opens the wifi AP and listens for the websocket data
- ESP8266/FSR -> The sketch for the ESP8266 which have the FSRs connected, connect to the AP and send the sensors data
- Server -> The node.js server which get the data from the serial port connected to the Access Point ESP8266
- src -> The parcel webserver files
- data_analysis -> Everything about the data related stuff (mostly csv and jupyter notebooks)
- 

## Screenshot
Screenshot of the current version of the frontend
![Screenshot](/screenshot.png)


## Data Analysis

### Data Recording 

`node server/record_data.js`

Works best if you have a wireless keyboard/controller and bind a/b to one of the buttons.

1. Connect all the sensors and servermcu to usb
2. Wear the sensors
3. Press 'a' or 'b' to start a recording
4. Perform a motion
5. Press 'a' or 'b' again to stop the recording


Data recording is done via the node js script. Mostly inspired by how charliegerad did it in her project:
https://github.com/charliegerard/gestures-ml-js

## Data Analysis 

Main file is `data_analysis/complete_set_analysis.ipynb`. Takes all files from `server/data`, parse their names and reads them into a pandas dataframe.

Data analysis is heavily inspired by ATLVHEAD project and his detailed video about it:
https://github.com/ATLTVHEAD/Atltvhead-Gesture-Recognition-Bracer
