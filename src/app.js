if (module.hot) {
    module.hot.accept();
}
//https://tailwindcss-neumorphism-demo.netlify.app/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lines = ['red', 'yellow', 'green', 'blue'];
const start = [200, 400];
const lineLength = 100;
let clientStatus;
let wsConnection;
const clientStatusElement = document.getElementById('clientStatusText');
document.getElementById('calibrate-btn').addEventListener("click", () => sendWSCommand("calibrate"));
document.getElementById('beep-btn').addEventListener("click", () => sendWSCommand("beep"));

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
        wsConnection = connection;
        setClientStatus('ws - connected');
        // subscribe to some channels
    };
    connection.onmessage = function (e) {
        handleWsMessage(e);
    };

    connection.onclose = function (e) {
        setClientStatus('ws - closed');
        wsConnection = null;
        console.log('Socket is closed. Reconnect will be attempted in 10 seconds.', e.reason);
        setTimeout(function () {
            setClientStatus('ws - reconnecting');
            connect();
        }, 10000);
    };

    connection.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        setClientStatus('ws - closed on error');
        connection.close();
    };
}

function setClientStatus(status) {
    clientStatus = status;
    clientStatusElement.innerHTML = new Date().getTime() + ' - ' + status;
}

function sendWSCommand(data) {
    if (clientStatus === 'ws - connected' && wsConnection) {
        const cmd = {
            type: 'command',
            client: 'server',
            target: 'client_1',
            data: data
        };
        wsConnection.send(JSON.stringify(cmd));
    } else {
        setClientStatus('ws - command failed to send');
    }
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
        const angleValue = wsAngles ? wsAngles[i] : 270;
        const angle = angleValue;
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
            statusElement.innerHTML = Object.entries(msgData).map(([key, value]) => {
                return `ID: ${key} Name: ${value.name} Status: ${value.status} IP: ${value.ip}`;
            }).join('<br />');
            break;
        case 'sensor-data':
            draw([msgData.angle1, msgData.angle2, msgData.angle3, msgData.angle4], [msgData.pressure1, msgData.pressure2]);
            break;
        default:
            console.log(msg);
            break;
    }
}
setClientStatus('ws - disconnected');

draw();
connect();