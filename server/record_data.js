const SerialPort = require('serialport');
const fs = require('fs');
const readLineParser = new SerialPort.parsers.Readline();
var XboxController = require('xbox-controller');
var xbox = new XboxController;
let streamCorrect, streamWrong;

let gestureType;
let startedCorrect = false;
let startedWrong = false;
let samplesCorrectNum = 0;
let samplesWrongNum = 0;


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




readLineParser.on('data', (data) => {
  try {
    const comPortdataObject = JSON.parse(data);
    if (comPortdataObject.type === "sensor-data") {

      sensorDataObject.pressure1 = comPortdataObject.data.fsr_1;
      sensorDataObject.pressure2 = comPortdataObject.data.fsr_2;
      sensorDataObject.angle1 = comPortdataObject.data.mpu_1.accel.y;
      sensorDataObject.angle2 = comPortdataObject.data.mpu_2.accel.y;
      sensorDataObject.angle3 = comPortdataObject.data.mpu_1.accel.y;
      sensorDataObject.angle4 = comPortdataObject.data.mpu_2.accel.y;

      xbox.on('a:press', function (key) {
        console.log(key + ' press');
        gestureType = 'correct';
        startedCorrect = true;
        streamCorrect = fs.createWriteStream(`./data/sample_${gestureType}_${samplesCorrectNum}.txt`, { flags: 'a' });
        streamCorrect.write(`${comPortdataObject.data.fsr_1} ${comPortdataObject.data.fsr_2} ${comPortdataObject.data.mpu_1.gyro.x} ${comPortdataObject.data.mpu_1.gyro.y} ${comPortdataObject.data.mpu_1.gyro.z} ${comPortdataObject.data.mpu_2.gyro.x} ${comPortdataObject.data.mpu_2.gyro.y} ${comPortdataObject.data.mpu_2.gyro.z}\r\n`);
      });

      xbox.on('a:release', function (key) {
        console.log(key + ' release');
        if (startedCorrect) {
          streamCorrect.end();
          startedCorrect = false;
          samplesCorrectNum += 1;
        }
      });

      xbox.on('b:press', function (key) {
        console.log(key + ' press');
        gestureType = 'wrong';
        startedWrong = true;
        streamWrong = fs.createWriteStream(`./data/sample_${gestureType}_${samplesWrongNum}.txt`, { flags: 'a' });
        streamCorrect.write(`${comPortdataObject.data.fsr_1} ${comPortdataObject.data.fsr_2} ${comPortdataObject.data.mpu_1.gyro.x} ${comPortdataObject.data.mpu_1.gyro.y} ${comPortdataObject.data.mpu_1.gyro.z} ${comPortdataObject.data.mpu_2.gyro.x} ${comPortdataObject.data.mpu_2.gyro.y} ${comPortdataObject.data.mpu_2.gyro.z}\r\n`);
      });

      xbox.on('b:release', function (key) {
        console.log(key + ' release');
        if (startedWrong) {
          streamWrong.end();
          startedWrong = false;
          samplesWrongNum += 1;
        }
      });

    }
  } catch (e) {
    console.log('ReadLineParserError: ', e);
    console.log('ReadLineParser:', data);
  }
});
