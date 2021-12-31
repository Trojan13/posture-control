const SerialPort = require("serialport");
const WebSocket = require('ws');

const readLineParser = new SerialPort.parsers.Readline();
const wss = new WebSocket.Server({ port: 8085 });

let sensorDataObject = {
  angle1: null,
  angle2: null,
  angle3: null,
  angle4: null,
  pressure1: null,
  pressure2: null,
};

SerialPort.list().then((ports) => {
  ports.forEach(function (port) {
    console.log(port);
  });
});
let port = new SerialPort("COM6", {
  baudRate: 115200
});

port.on('open', () => {
  console.log('Serial Port Connected...');
  port.pipe(readLineParser);
});

port.on('error', (err) => {
  console.log(err);
});

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })

  readLineParser.on('data', (data) => {
    const comPortdataObject = JSON.parse(data);
    if (comPortdataObject.ws_client === "client_3") {
      sensorDataObject.pressure1 = comPortdataObject.fsr_1;
      sensorDataObject.pressure2 = comPortdataObject.fsr_2;
    }
    if (comPortdataObject.ws_client === "client_1") {
      sensorDataObject.angle1 = comPortdataObject.mpu_1.accel.y;
      sensorDataObject.angle2 = comPortdataObject.mpu_2.accel.y;
    }
    if (comPortdataObject.ws_client === "client_2") {
      sensorDataObject.angle3 = comPortdataObject.mpu_1.accel.y;
      sensorDataObject.angle4 = comPortdataObject.mpu_2.accel.y;
    }
    if (sensorDataObject.pressure1 && sensorDataObject.pressure2 && sensorDataObject.angle1 && sensorDataObject.angle2 && sensorDataObject.angle3 && sensorDataObject.angle4) {
      ws.send(JSON.stringify({ sensorDataObject }));
    }
    console.log(data);
  });
});