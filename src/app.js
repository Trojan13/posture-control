if (module.hot) {
    module.hot.accept();
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lines = ['red', 'yellow', 'green', 'blue'];
const start = [200, 400];
const lineLength = 100;

let image = new Image();
image.src = new URL(
    './assets/foot.png',
    import.meta.url
);
image.onload = () => {
    drawFoot(ctx);
};

function connect() {
    const connection = new WebSocket('ws://localhost:8085');
    connection.onopen = function () {
        console.log('Connected!');
        // subscribe to some channels
    };
    connection.onmessage = function (e) {
        handleWsMessage(e);
    };

    connection.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 10 seconds.', e.reason);
        setTimeout(function () {
            connect();
        }, 10000);
    };

    connection.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        connection.close();
    };
}


function drawCircle(ctx, pressure1 = 0, pressure2 = 0) {
    const radius1 = 5 + 30 / 200 * pressure1;
    const radius2 = 5 + 30 / 200 * pressure2;
    ctx.beginPath();
    ctx.arc(60, 90, radius2, 0, 2 * Math.PI, false);
    ctx.arc(55, 180, radius1, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
}

function drawFoot(ctx) {
    ctx.drawImage(image, 10, 10, 100, 200);
}

function draw(wsAngles = null, wsPressure = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let prev = start;
    for (let i = 0; i < lines.length; i++) {
        const angleValue = wsAngles ? wsAngles[i] : 300;
        const angle = (Math.PI * angleValue) / 180;
        ctx.beginPath();
        ctx.moveTo(...prev);
        ctx.strokeStyle = lines[i];
        ctx.lineTo(
            prev[0] + lineLength * Math.cos(angle),
            prev[1] + lineLength * Math.sin(angle)
        );
        prev = [
            prev[0] + lineLength * Math.cos(angle),
            prev[1] + lineLength * Math.sin(angle)
        ];
        ctx.stroke();
        ctx.closePath();
    }
    drawCircle(ctx, wsPressure ? wsPressure[0] : 0, wsPressure ? wsPressure[1] : 0);
    drawFoot(ctx);
}
function handleWsMessage(msg) {
    const parsedMessage = JSON.parse(msg.data);
    const statusElement = document.getElementById('statusText');
    const msgTime = new Date(parsedMessage.date).toLocaleTimeString();
    const msgData = parsedMessage.data;
    const msgType = parsedMessage.type;

    switch (msgType) {
        case 'status':
            statusElement.innerHTML = msgData;
            break;
        case 'sensor-data':
            draw([msgData.angle1, msgData.angle2, msgData.angle3, msgData.angle4], [msgData.pressure1, msgData.pressure2]);
            break;
        default:
            console.log(msg);
            break;
    }
}

draw();
connect();