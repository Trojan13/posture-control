const { IMU, Board } = require("johnny-five");
const board = new Board({
    port: "COM4"
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

  imu.on("change", () => {
    const d = { x: imu.gyro.pitch,y:imu.gyro.roll,z:imu.gyro.yaw};
    console.log(d);
    ws.send(JSON.stringify(d));
    /*const {acceleration, inclination, orientation, pitch, roll, x, y, z} = accelerometer;
    console.log("Accelerometer:");
    console.log("  x            : ", x);
    console.log("  y            : ", y);
    console.log("  z            : ", z);
    console.log("  pitch        : ", pitch);
    console.log("  roll         : ", roll);
    console.log("  acceleration : ", acceleration);
    console.log("  inclination  : ", inclination);
    console.log("  orientation  : ", orientation);
    console.log("--------------------------------------");*/
  });
});
});