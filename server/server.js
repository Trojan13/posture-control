const { IMU, Board } = require("johnny-five");
const board = new Board({
  port: "COM3"
});

board.on("ready", () => {
  const imu = new IMU({
    controller: "MPU6050"
  });
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
});