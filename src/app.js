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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let prev = start;
    for (let i = 0; i < lines.length; i++) {
        const angle = (Math.PI * document.getElementById(`angle${i}`).value) / 180;
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


    console.log(e);
    const d = JSON.parse(e.data);
    const alpha = toRadian(d.x)
    const beta = toRadian(d.y)
    const gamma = toRadian(d.z)

    cube.rotation.x = beta
    cube.rotation.y = gamma
    cube.rotation.z = alpha
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
};