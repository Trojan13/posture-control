const SerialPort = require("serialport");

SerialPort.list(function (err, ports) {
  ports.forEach(function (port) {
    console.log(port.comName, port.pnpId, port.manufacturer); // or console.log(port)
  });
});
let port = new SerialPort("COM5", {
  baudRate: 115200
});

port.on('open', function () {
  console.log('Serial Port Connected...');
});

let buffer = '';
port.on('data', function (chunk) {
  buffer += chunk;
  var answers = buffer.split(/\r?\n/);
  buffer = answers.pop();

  if (answer.length > 0)
    console.log(answer[0]);
});

port.on('error', function (err) {
  console.log(err);
});

/*
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({ port: 8085 })

  wss.on('connection', ws => {
    ws.on('message', message => {
      console.log(`Received message => ${message}`)
    })

    //http://johnny-five.io/examples/imu-mpu6050/
    imu.on("change", () => {
      const d = { x: imu.gyro.pitch, y: imu.gyro.roll, z: imu.gyro.yaw };
      ws.send(JSON.stringify(d));
    });
  });
  */