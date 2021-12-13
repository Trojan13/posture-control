if (module.hot) {
    module.hot.accept();
}
const connection = new WebSocket('ws://localhost:8085');
connection.onerror = error => {
    console.error(error)
};
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const lines = ["red", "yellow", "green", "blue"];
const start = [200, 400];
const lineLength = 100;

function draw(wsAngles = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let prev = start;
    for (let i = 0; i < lines.length; i++) {
        const angleValue = wsAngles ? wsAngles[i] : document.getElementById(`angle${i}`).value;
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
}
draw();

window.onSliderInput = function onSliderInput(e, slider) {
    return draw();
};

connection.onmessage = e => {
    const d = JSON.parse(e.data);
    const dy = d.y;
    draw([dy,0,0,0]);
};