const SerialPort = require("serialport");
const WebSocket = require('ws');

const readLineParser = new SerialPort.parsers.Readline();
const wss = new WebSocket.Server({ port: 8085 });
let wssStatus = 0;
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
readLineParser.on('data', (data) => {
  if (wssStatus === 1 && wsHandle) {
    try {
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
      if (sensorDataObject.pressure1 !== null && sensorDataObject.pressure2 !== null && sensorDataObject.angle1 !== null && sensorDataObject.angle2 !== null && sensorDataObject.angle3 !== null && sensorDataObject.angle4 !== null) {
        wsHandle.send(JSON.stringify({ sensorDataObject }));
      }
      console.log(sensorDataObject);
    } catch (e) {
      console.log("ReadLineParserError: ", e);
      console.log("ReadLineParser:", data);
    }
  }
});
wss.on('connection', ws => {
  console.log("WS Connected!", ws);
  wssStatus = 1;
  wsHandle = ws;
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
});