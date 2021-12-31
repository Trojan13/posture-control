const SerialPort = require("serialport");
const WebSocket = require('ws');

const readLineParser = new SerialPort.parsers.Readline();
const wss = new WebSocket.Server({ port: 8085 });

let pressureArray = [];
let anglesArray1 = [];
let anglesArray2 = [];

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
      pressureArray = [comPortdataObject.fsr_1,comPortdataObject.fsr_2];
    }
    if (comPortdataObject.ws_client === "client_1" ) {
      anglesArray1 = [comPortdataObject.mpu_1.accel.y,comPortdataObject.mpu_2.accel.y];
    }
    if (comPortdataObject.ws_client === "client_2" ) {
      anglesArray2 = [comPortdataObject.mpu_1.accel.y,comPortdataObject.mpu_2.accel.y];
    }
    if(pressureArray && anglesArray1 && anglesArray2) {
    ws.send(JSON.stringify({angle}));
      
    }
    console.log(data);
  });
});