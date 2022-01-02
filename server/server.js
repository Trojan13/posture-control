const SerialPort = require('serialport');
const WebSocket = require('ws');

const readLineParser = new SerialPort.parsers.Readline();
const wss = new WebSocket.Server({ port: 8085 });
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
  if (wssStatus === 1 && wsHandle) {
    try {
      const comPortdataObject = JSON.parse(data);
      if (comPortdataObject.type === "sensor-data") {
        if (comPortdataObject.client === 'fsr') {
          sensorDataObject.pressure1 = comPortdataObject.data.fsr_1;
          sensorDataObject.pressure2 = comPortdataObject.data.fsr_2;
        }
        if (comPortdataObject.client === 'mpu_1') {
          sensorDataObject.angle1 = comPortdataObject.data.mpu_1.accel.y;
          sensorDataObject.angle2 = comPortdataObject.data.mpu_2.accel.y;
        }
        if (comPortdataObject.client === 'mpu_2') {
          sensorDataObject.angle3 = comPortdataObject.data.mpu_1.accel.y;
          sensorDataObject.angle4 = comPortdataObject.data.mpu_2.accel.y;
        }
        webSocketSendData(wsHandle, sensorDataObject, 'sensor-data');
      } else if (comPortdataObject.type === "status") {
        const clientName = comPortdataObject.client.split("\ws?client=");
        if (Array.isArray(clientName)) {
          clientStatus[clientName[1]] = { ip: comPortdataObject.data.ip, num: comPortdataObject.num, status: comPortdataObject.data.status };
          webSocketSendData(wsHandle, clientStatus, 'status');
        console.log(clientStatus);

        }
      }
    } catch (e) {
      console.log('ReadLineParserError: ', e);
      console.log('ReadLineParser:', data);
    }
  }
});



function webSocketSendData(handle, data, type) {
  handle.send(JSON.stringify({ type: type, data: data, date: new Date() }));
}

wss.on('connection', ws => {
  console.log('WS Connected!', ws);
  wssStatus = 1;
  wsHandle = ws;
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
});