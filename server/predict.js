const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const SerialPort = require('serialport');
const readLineParser = new SerialPort.parsers.Readline();

let liveData = [];
let myData = {};

let predictionDone = true;

let model;
const gestureClasses = ['correct', 'wrong'];

SerialPort.list().then((ports) => {
    ports.forEach(function (port) {
        console.log(port);
    });
});
let port = new SerialPort('COM6', {
    baudRate: 115200
});

port.on('open', async () => {
    console.log('Serial Port Connected...');
    model = await tf.loadLayersModel('file://model/model.json');
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
                myData.fsr_1 = comPortdataObject.data.fsr_1
                myData.fsr_2 = comPortdataObject.data.fsr_2
            }
            if (comPortdataObject.client === 'mpu_1') {
                myData.gyrox_1 = comPortdataObject.data.mpu_1.gyro.x
                myData.gyroy_1 = comPortdataObject.data.mpu_1.gyro.y
                myData.gyroz_1 = comPortdataObject.data.mpu_1.gyro.z
                myData.gyrox_2 = comPortdataObject.data.mpu_2.gyro.x
                myData.gyroy_2 = comPortdataObject.data.mpu_2.gyro.y
                myData.gyroz_2 = comPortdataObject.data.mpu_2.gyro.z
            }
            if (comPortdataObject.client === 'mpu_2') {
                myData.gyrox_3 = comPortdataObject.data.mpu_1.gyro.x
                myData.gyroy_3 = comPortdataObject.data.mpu_1.gyro.y
                myData.gyroz_3 = comPortdataObject.data.mpu_1.gyro.z
                myData.gyrox_4 = comPortdataObject.data.mpu_2.gyro.x
                myData.gyroy_4 = comPortdataObject.data.mpu_2.gyro.y
                myData.gyroz_4 = comPortdataObject.data.mpu_2.gyro.z
            }
        }
        if (myData.fsr_2 && myData.fsr_2 && myData.gyrox_1 && myData.gyroy_1 && myData.gyroz_1 && myData.gyrox_2 && myData.gyroy_2 && myData.gyroz_2 && myData.gyrox_3 && myData.gyroy_3 && myData.gyroz_3 && myData.gyrox_4 && myData.gyroy_4 && myData.gyroz_4) {
            if (predictionDone) {
                if (liveData.length < 15) {
                    console.log(liveData.length);
                    liveData.push(myData.fsr_1, myData.fsr_2, myData.gyrox_1, myData.gyroy_1, myData.gyroz_1, myData.gyrox_2, myData.gyroy_2, myData.gyroz_2, myData.gyrox_3, myData.gyroy_3, myData.gyroz_3, myData.gyrox_4, myData.gyroy_4, myData.gyroz_4)
                } else {
                    predictionDone = false;
                }
            } else {
                if (!predictionDone && liveData.length) {
                    predictionDone = true;
                    predict(model, liveData);
                    liveData = [];
                }
            }
            myData = {};
        }
    } catch (e) {
        console.log('ReadLineParserError: ', e);
        console.log('ReadLineParser:', data);
    }
});

const predict = (model, newSampleData) => {
    tf.tidy(() => {
        console.log(newSampleData);
        const inputData = newSampleData;
        const input = tf.tensor2d([inputData], [1, 28]);
        const predictOut = model.predict(input);
        const winner = gestureClasses[predictOut.argMax(-1).dataSync()[0]];

        console.log("GESTURE: ", winner);

        switch (winner) {
            case 'correct':
                //socket.emit('correct');
                break;
            case 'wrong':
                // socket.emit('wrong');
                break;
        }
    });
}