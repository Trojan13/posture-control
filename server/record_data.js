const SerialPort = require('serialport');
const fs = require('fs');
const readLineParser = new SerialPort.parsers.Readline();
const ioHook = require('iohook');


ioHook.start();

let streamCorrect;
let streamWrong;

let gestureType;
let startedCorrect = false;
let startedWrong = false;
let samplesCorrectNum = 0;
let samplesWrongNum = 0;

let myData = {};

SerialPort.list().then((ports) => {
  ports.forEach(function (port) {
    console.log(port);
  });
});
let port = new SerialPort('COM6', {
  baudRate: 115200
});

port.on('open', () => {
  console.log('Serial Port Connected...');
  port.pipe(readLineParser);
});

port.on('error', (err) => {
  console.log(err);
});

ioHook.on('keypress', function (msg) {
  if (!startedCorrect && msg.rawcode === 65) { //AAAAAA
    console.log('recording correct');
    gestureType = 'correct';
    startedCorrect = true;
    streamCorrect = fs.createWriteStream(`./data/sample_${gestureType}_${samplesCorrectNum}.txt`, {
      flags: 'a'
    });
  } else if (!startedWrong && msg.rawcode === 66) { // BBBBBBBB
    console.log('recording wrong');
    gestureType = 'wrong';
    startedWrong = true;
    streamWrong = fs.createWriteStream(`./data/sample_${gestureType}_${samplesWrongNum}.txt`, {
      flags: 'a'
    });
  } else if (startedCorrect && msg.rawcode === 65) { //AAAAAA
    console.log('stopped correct');
    if (startedCorrect) {
      streamCorrect.end();
      startedCorrect = false;
      samplesCorrectNum += 1;
    }
  } else if (startedWrong && msg.rawcode === 66) { // BBBBBBBB
    console.log('stopped wrong');
    if (startedWrong) {
      streamWrong.end();
      startedWrong = false;
      samplesWrongNum += 1;
    }
  }
});

readLineParser.on('data', (data) => {
  try {
    const comPortdataObject = JSON.parse(data);
    if (comPortdataObject.type === "sensor-data") {
      if (comPortdataObject.client === 'fsr') {
        myData.fsr_1 = comPortdataObject.data.fsr_1
        myData.fsr_2 = comPortdataObject.data.fsr_2
      }
      if (comPortdataObject.client === 'mpu_1') {
        myData.gyrox_1 = comPortdataObject.data.mpu_1.gyro.x
        myData.gyroy_1 = comPortdataObject.data.mpu_1.gyro.y
        myData.gyroz_1 = comPortdataObject.data.mpu_1.gyro.z
        myData.gyrox_2 = comPortdataObject.data.mpu_2.gyro.x
        myData.gyroy_2 = comPortdataObject.data.mpu_2.gyro.y
        myData.gyroz_2 = comPortdataObject.data.mpu_2.gyro.z
      }
      if (comPortdataObject.client === 'mpu_2') {
        myData.gyrox_3 = comPortdataObject.data.mpu_1.gyro.x
        myData.gyroy_3 = comPortdataObject.data.mpu_1.gyro.y
        myData.gyroz_3 = comPortdataObject.data.mpu_1.gyro.z
        myData.gyrox_4 = comPortdataObject.data.mpu_2.gyro.x
        myData.gyroy_4 = comPortdataObject.data.mpu_2.gyro.y
        myData.gyroz_4 = comPortdataObject.data.mpu_2.gyro.z
      }
    }
    if (myData.fsr_2 && myData.fsr_2 && myData.gyrox_1 && myData.gyroy_1 && myData.gyroz_1 && myData.gyrox_2 && myData.gyroy_2 && myData.gyroz_2 && myData.gyrox_3 && myData.gyroy_3 && myData.gyroz_3 && myData.gyrox_4 && myData.gyroy_4 && myData.gyroz_4) {
      if (startedCorrect) {
        streamCorrect.write(`${myData.fsr_1} ${myData.fsr_2} ${myData.gyrox_1} ${myData.gyroy_1} ${myData.gyroz_1} ${myData.gyrox_2} ${myData.gyroy_2} ${myData.gyroz_2} ${myData.gyrox_3} ${myData.gyroy_3} ${myData.gyroz_3} ${myData.gyrox_4} ${myData.gyroy_4} ${myData.gyroz_4}\r\n`);
      }
      if (startedWrong) {
        streamWrong.write(`${myData.fsr_1} ${myData.fsr_2} ${myData.gyrox_1} ${myData.gyroy_1} ${myData.gyroz_1} ${myData.gyrox_2} ${myData.gyroy_2} ${myData.gyroz_2} ${myData.gyrox_3} ${myData.gyroy_3} ${myData.gyroz_3} ${myData.gyrox_4} ${myData.gyroy_4} ${myData.gyroz_4}\r\n`);
      }
      myData = {};
    }
  } catch (e) {
    console.log('ReadLineParserError: ', e);
    console.log('ReadLineParser:', data);
  }
});