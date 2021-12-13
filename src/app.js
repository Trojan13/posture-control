if (module.hot) {
    module.hot.accept();
}
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