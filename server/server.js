const SerialPort = require("serialport");
const WebSocket = require('ws')

const readLineParser = new SerialPort.parsers.Readline();
const wss = new WebSocket.Server({ port: 8085 });

SerialPort.list().then((ports)=> {
  ports.forEach(function (port) {
    console.log(port);
  });
});
let port = new SerialPort("COM6", {
  baudRate: 115200
});



  wss.on('connection', ws => {
    ws.on('message', message => {
      console.log(`Received message => ${message}`)
    })
    
readLineParser.on('data', (data)=>{
  ws.send(JSON.stringify(data));
  console.log(data);
  });
  });