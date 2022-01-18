const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const SerialPort = require('serialport');
const readLineParser = new SerialPort.parsers.Readline();

let liveData = [];
let predictionDone = false;

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

port.on('open', () => {
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
            daydream.onStateChange(function (data) {
                if (predictionDone) {
                    predictionDone = false;
                    if (liveData.length < 168) {
                        liveData.push(comPortdataObject.data.fsr_1, comPortdataObject.data.fsr_2, comPortdataObject.data.gyrox_1, comPortdataObject.data.gyroy_1, comPortdataObject.data.gyroz_1, comPortdataObject.data.gyrox_2, comPortdataObject.data.gyroy_2, comPortdataObject.data.gyroz_2, comPortdataObject.data.gyrox_3, comPortdataObject.data.gyroy_3, comPortdataObject.data.gyroz_3, comPortdataObject.data.gyrox_4, comPortdataObject.data.gyroy_4, comPortdataObject.data.gyroz_4)
                    }
                } else {
                    if (!predictionDone && liveData.length) {
                        predictionDone = true;
                        predict(model, liveData, socket);
                        liveData = [];
                    }
                }
            });
        }
    } catch (e) {
        console.log('ReadLineParserError: ', e);
        console.log('ReadLineParser:', data);
    }
});

const predict = (model, newSampleData, socket) => {
    tf.tidy(() => {
        const inputData = newSampleData;
        const input = tf.tensor2d([inputData], [1, 168]);
        const predictOut = model.predict(input);
        const winner = gestureClasses[predictOut.argMax(-1).dataSync()[0]];

        console.log("GESTURE: ", winner);

        switch (winner) {
            case 'correct':
                socket.emit('correct');
                break;
            case 'wrong':
                socket.emit('wrong');
                break;
        }
    });
}