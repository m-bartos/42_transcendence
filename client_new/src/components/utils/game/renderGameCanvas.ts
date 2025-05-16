import {c} from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";
import {WsDataLive, WsGameDataProperties} from "../../../types/game";

interface Ball {
    x: number;
    y: number;
    semidiameter: number;
}

interface GameData {
    status: string;
    ball: Ball;
    paddles: [];
    players: [];
    timestamp: number;
}


// Todo - scaling values will be provided from the server
function scaleX(x: number, canvas: HTMLCanvasElement): number {
    return (x / 200) * canvas.width;
}
function scaleY(y: number, canvas: HTMLCanvasElement): number {
    return (y / 100) * canvas.height;
}

// Basic resizing
// function resizeCanvas(canvas: HTMLCanvasElement) {
//     canvas.width = canvas.clientWidth;
//     canvas.height = canvas.clientHeight;
// }

// From Mira's code
const resizeCanvas = (function () {
    let aspectRation = 1;

    return function resizeCanvas(canvas: HTMLCanvasElement, dimensions?: WsGameDataProperties) {
        if (dimensions && dimensions.canvas.height !== 0) {
            aspectRation = dimensions.canvas.width / dimensions.canvas.height;
        }

        const canvasContainer = document.getElementById("gameCanvasContainer") as HTMLCanvasElement;
        if (!canvasContainer) {
            console.error("Canvas container not found");
            return;
        }

        if (window.innerWidth >= 640 && window.innerWidth < 768) {
            canvas.width = canvasContainer.offsetWidth - (1 / 12 * canvasContainer.offsetWidth);
        } else {
            canvas.width = canvasContainer.offsetWidth;
        }

        canvas.height = canvas.width / aspectRation;
    };
})();

function drawNet(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.strokeStyle = '#555';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(scaleX(100, canvas), 0);
    ctx.lineTo(scaleX(100, canvas), canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPaddles(ctx: CanvasRenderingContext2D, paddles: any[], canvas: HTMLCanvasElement) {
    ctx.fillStyle = '#ccc';
    paddles.forEach((paddle, i) => {
        const ph = scaleY(paddle.height, canvas);
        const pw = scaleX(paddle.width, canvas);
        const py = scaleY(paddle.yCenter, canvas) - ph / 2;
        const px = scaleX(paddle.xCenter, canvas) - pw / 2;
        ctx.fillRect(px, py, pw, ph);
    });

}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball ,canvas: HTMLCanvasElement) {
    ctx.beginPath();
    ctx.arc(
        scaleX(ball.x, canvas),
        scaleY(ball.y, canvas),
        scaleX(ball.semidiameter, canvas), // or average if you prefer
        0,
        Math.PI * 2
    );
    ctx.fillStyle = '#f00';
    ctx.fill();
    ctx.closePath();
}

export function renderGameCanvas(canvas: HTMLCanvasElement, gameData?: WsDataLive, dimensions?: WsGameDataProperties) {

    resizeCanvas(canvas, dimensions);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    // default game render before any data is received from the server for drawing game structure
    if (!gameData)
    {
        drawNet(ctx, canvas);
        drawPaddles(ctx, [{ yCenter: 50, height: 25, width: 0.5}, { yCenter: 50, height: 25, width: 0.5}], canvas);
        drawBall(ctx, {x: 100, y: 50, semidiameter: 1}, canvas)
    }
    // event driven handler - data received from the server
    else {
        drawNet(ctx, canvas);
        drawPaddles(ctx, gameData.paddles, canvas);
        drawBall(ctx, gameData.ball, canvas);
    }
}