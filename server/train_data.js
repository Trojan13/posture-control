const SerialPort = require('serialport');

const readLineParser = new SerialPort.parsers.Readline();

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
        const clientName = comPortdataObject.data.client ? comPortdataObject.data.client.split("\ws?client=")[1] : '-';
        clientStatus[comPortdataObject.clientId] = { ip: comPortdataObject.data.ip, status: comPortdataObject.data.status, name: clientName };
        webSocketSendData(wsHandle, clientStatus, 'status');
        console.log(clientStatus);

      }
    } catch (e) {
      console.log('ReadLineParserError: ', e);
      console.log('ReadLineParser:', data);
    }
});
