const SerialPort = require('serialport');
const fs = require('fs');
const readLineParser = new SerialPort.parsers.Readline();
const ioHook = require('iohook');
const cp = require('child_process');



ioHook.start();

let streamCorrect;
let streamWrong;

const MAX_LINES = 19;

let gestureType;
let startedCorrect = false;
let startedWrong = false;
let samplesCorrectNum = 0;
let samplesWrongNum = 0;
let linesCorrect = 0;
let linesWrong = 0;

let timer = null;


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
    timer = process.hrtime();
    linesWrong = 0;
    gestureType = 'correct';
    startedCorrect = true;
    streamCorrect = fs.createWriteStream(`./data/sample_${gestureType}_${samplesCorrectNum}.txt`, {
      flags: 'a'
    });
  } else if (!startedWrong && msg.rawcode === 66) { // BBBBBBBB
    console.log('recording wrong');
    timer = process.hrtime();
    linesCorrect = 0;
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
      linesCorrect = 0;
    }
  } else if (startedWrong && msg.rawcode === 66) { // BBBBBBBB
    console.log('stopped wrong');
    if (startedWrong) {
      streamWrong.end();
      startedWrong = false;
      samplesWrongNum += 1;
      linesWrong = 0;
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
      if (comPortdataObject.client === 'back_top') {
        myData.gyrox_1 = comPortdataObject.data.mpu_1.gyro.x
        myData.gyroy_1 = comPortdataObject.data.mpu_1.gyro.y
        myData.gyroz_1 = comPortdataObject.data.mpu_1.gyro.z
        myData.gyrox_2 = comPortdataObject.data.mpu_2.gyro.x
        myData.gyroy_2 = comPortdataObject.data.mpu_2.gyro.y
        myData.gyroz_2 = comPortdataObject.data.mpu_2.gyro.z

        myData.accelx_1 = comPortdataObject.data.mpu_1.accel.x
        myData.accely_1 = comPortdataObject.data.mpu_1.accel.y
        myData.accelz_1 = comPortdataObject.data.mpu_1.accel.z
        myData.accelx_2 = comPortdataObject.data.mpu_2.accel.x
        myData.accely_2 = comPortdataObject.data.mpu_2.accel.y
        myData.accelz_2 = comPortdataObject.data.mpu_2.accel.z
      }
      if (comPortdataObject.client === 'back_bot') {
        myData.gyrox_3 = comPortdataObject.data.mpu_1.gyro.x
        myData.gyroy_3 = comPortdataObject.data.mpu_1.gyro.y
        myData.gyroz_3 = comPortdataObject.data.mpu_1.gyro.z
        myData.gyrox_4 = comPortdataObject.data.mpu_2.gyro.x
        myData.gyroy_4 = comPortdataObject.data.mpu_2.gyro.y
        myData.gyroz_4 = comPortdataObject.data.mpu_2.gyro.z

        myData.accelx_3 = comPortdataObject.data.mpu_1.accel.x
        myData.accely_3 = comPortdataObject.data.mpu_1.accel.y
        myData.accelz_3 = comPortdataObject.data.mpu_1.accel.z
        myData.accelx_4 = comPortdataObject.data.mpu_2.accel.x
        myData.accely_4 = comPortdataObject.data.mpu_2.accel.y
        myData.accelz_4 = comPortdataObject.data.mpu_2.accel.z
      }
    }
    if (myData.fsr_2 && myData.fsr_2 && myData.gyrox_1 && myData.gyroy_1 && myData.gyroz_1 && myData.gyrox_2 && myData.gyroy_2 && myData.gyroz_2 && myData.gyrox_3 && myData.gyroy_3 && myData.gyroz_3 && myData.gyrox_4 && myData.gyroy_4 && myData.gyroz_4 && myData.accelx_1 && myData.accely_1 && myData.accelz_1 && myData.accelx_2 && myData.accely_2 && myData.accelz_2 && myData.accelx_3 && myData.accely_3 && myData.accelz_3 && myData.accelx_4 && myData.accely_4 && myData.accelz_4) {
      let elapsedTime = (process.hrtime(timer)[1] / 1000000).toFixed(2);
      if (startedCorrect && linesCorrect <= MAX_LINES) {
        streamCorrect.write(`${elapsedTime} ${myData.fsr_1} ${myData.fsr_2} ${myData.gyrox_1} ${myData.gyroy_1} ${myData.gyroz_1} ${myData.gyrox_2} ${myData.gyroy_2} ${myData.gyroz_2} ${myData.gyrox_3} ${myData.gyroy_3} ${myData.gyroz_3} ${myData.gyrox_4} ${myData.gyroy_4} ${myData.gyroz_4} ${myData.accelx_1} ${myData.accely_1} ${myData.accelz_1} ${myData.accelx_2} ${myData.accely_2} ${myData.accelz_2} ${myData.accelx_3} ${myData.accely_3} ${myData.accelz_3} ${myData.accelx_4} ${myData.accely_4} ${myData.accelz_4}\r\n`);
        linesCorrect++;
      }
      if (startedWrong && linesWrong <= MAX_LINES) {
        streamWrong.write(`${elapsedTime} ${myData.fsr_1} ${myData.fsr_2} ${myData.gyrox_1} ${myData.gyroy_1} ${myData.gyroz_1} ${myData.gyrox_2} ${myData.gyroy_2} ${myData.gyroz_2} ${myData.gyrox_3} ${myData.gyroy_3} ${myData.gyroz_3} ${myData.gyrox_4} ${myData.gyroy_4} ${myData.gyroz_4} ${myData.accelx_1} ${myData.accely_1} ${myData.accelz_1} ${myData.accelx_2} ${myData.accely_2} ${myData.accelz_2} ${myData.accelx_3} ${myData.accely_3} ${myData.accelz_3} ${myData.accelx_4} ${myData.accely_4} ${myData.accelz_4}\r\n`);
        linesWrong++;
      }
      myData = {};
    }
  } catch (e) {
    console.log('ReadLineParserError: ', e);
    console.log('ReadLineParser:', data);
  }
});

setInterval(() => {
  if ((startedWrong || startedCorrect) && (linesWrong === 18 || linesCorrect === 18)) {
    console.log("18");
  }
  if ((startedWrong || startedCorrect) && (linesWrong === 20 || linesCorrect === 20)) {
    console.log("20");
  }
}, 100);