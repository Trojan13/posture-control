const SerialPort = require('serialport');
const WebSocket = require('ws');

const readLineParser = new SerialPort.parsers.Readline();
const wss = new WebSocket.Server({
  port: 8085
});
let wssStatus = 0;
let clientStatus = {};
let wsHandle = null;
let sensorDataObject = {
  angle1: 0,
  angle2: 0,
  angle3: 0,
  angle4: 0,
  pressure1: 0,
  pressure2: 0,
};
let calibrationFactor = 1;
let sensorDataCalibrateObject = {
  angle1: 0,
  angle2: 0,
  angle3: 0,
  angle4: 0,
  pressure1: 0,
  pressure2: 0,
};
let isCalibrating;
let calibrationDataArray = Array(6).fill(null).map(() => Array(0));
let calibrationBaseValue = 0;
SerialPort.list().then((ports) => {
  ports.forEach(function (port) {
    // console.log(port);
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
  // console.log(err);
});

readLineParser.on('data', (data) => {
  if (wssStatus === 1 && wsHandle) {
    try {
      const comPortdataObject = JSON.parse(data);
      if (comPortdataObject.type === "sensor-data") {
        if (comPortdataObject.client === 'fsr') {
          sensorDataObject.pressure1 = comPortdataObject.data.fsr_1 + sensorDataCalibrateObject.pressure1;
          sensorDataObject.pressure2 = comPortdataObject.data.fsr_2 + sensorDataCalibrateObject.pressure2;
        }
        if (comPortdataObject.client === 'mpu_1') {
          sensorDataObject.angle1 = comPortdataObject.data.mpu_1.roll;
          sensorDataObject.angle2 = comPortdataObject.data.mpu_2.roll;
        }
        if (comPortdataObject.client === 'mpu_2') {
          sensorDataObject.angle3 = comPortdataObject.data.mpu_1.roll;
          sensorDataObject.angle4 = comPortdataObject.data.mpu_2.roll;
        }
        if (isCalibrating) calibrateSensors(sensorDataObject);
        console.log(sensorDataObject)
        webSocketSendData(wsHandle, sensorDataObject, 'sensor-data');
      } else if (comPortdataObject.type === "status") {
        const clientName = comPortdataObject.data.client ? comPortdataObject.data.client.split("\ws?client=")[1] : '-';
        clientStatus[comPortdataObject.clientId] = {
          ip: comPortdataObject.data.ip,
          status: comPortdataObject.data.status,
          name: clientName
        };
        webSocketSendData(wsHandle, clientStatus, 'status');
      }
    } catch (e) {
      // console.log('ReadLineParserError: ', e);
      // console.log('ReadLineParser:', data);
    }
  }
});

function calibrateSensors(sensorData) {
  calibrationDataArray[0].push(sensorData.pressure1);
  calibrationDataArray[1].push(sensorData.pressure2);
  calibrationDataArray[2].push(sensorData.angle1);
  calibrationDataArray[3].push(sensorData.angle2);
  calibrationDataArray[4].push(sensorData.angle3);
  calibrationDataArray[5].push(sensorData.angle4);
}

function stopCalibrating() {
  console.log(calibrationDataArray);

  const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  sensorDataCalibrateObject = {
    angle1: calibrationBaseValue - average(calibrationDataArray[2]),
    angle2: calibrationBaseValue - average(calibrationDataArray[3]),
    angle3: calibrationBaseValue - average(calibrationDataArray[4]),
    angle4: calibrationBaseValue - average(calibrationDataArray[5]),
    pressure1: 0,
    pressure2: 0,
  };
  isCalibrating = false;
}

function webSocketSendData(handle, data, type) {
  handle.send(JSON.stringify({
    type: type,
    data: data,
    date: new Date()
  }));
}

wss.on('connection', ws => {
  console.log('WS Connected!');
  wssStatus = 1;
  wsHandle = ws;
  ws.on('message', message => {
    const obj = JSON.parse(message);
    console.log(obj);
    if (obj.type === 'command' && obj.data === 'calibrate') {
      isCalibrating = true;
      setTimeout(() => {
        stopCalibrating();
      }, 5000);
    } else {
      try {
        port.write(message);
        console.log("Written command to serial");
      } catch (e) {
        console.log(e);
      }
    }
  })
});