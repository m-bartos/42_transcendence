import {c} from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";
import {WsDataLive, WsGameDataProperties} from "../../../types/multiplayer-game";
import { SplitKeyboardSettings } from "./renderHtmlGameLayout";
import { GameType } from "./renderHtmlGameLayout";

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

function resizeCanvas(canvas: HTMLCanvasElement, dimensions?: WsGameDataProperties ) {
    const canvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
    if(canvasWrapper) {
        if((window.innerHeight - 200) < (window.innerWidth / 2)) {
        canvasWrapper.style.height = (window.innerHeight -200) + 'px';
        canvasWrapper.style.width = (canvasWrapper.offsetHeight * 1.5) + 'px';
        }
        else {
            canvasWrapper.style.height = (canvasWrapper.offsetWidth / 1.5) + 'px';
        }
        if(canvasWrapper.offsetHeight < 200) {
            canvasWrapper.style.height = '200px';
            canvasWrapper.style.width = (canvasWrapper.offsetHeight * 1.5) + 'px';
        }
        const width = canvasWrapper.clientWidth;
        const height = canvasWrapper.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
}

function drawNet(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.strokeStyle = '#555';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(scaleX(100, canvas), 0);
    ctx.lineTo(scaleX(100, canvas), canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPaddles(ctx: CanvasRenderingContext2D, paddles: any[], canvas: HTMLCanvasElement, paddleColor: string) {
    ctx.fillStyle = paddleColor; // #ccc
    paddles.forEach((paddle, i) => {
        const ph = scaleY(paddle.height, canvas);
        const pw = scaleX(paddle.width, canvas);
        const py = scaleY(paddle.yCenter, canvas) - ph / 2;
        const px = scaleX(paddle.xCenter, canvas) - pw / 2;
        ctx.fillRect(px, py, pw, ph);
    });
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball ,canvas: HTMLCanvasElement, ballColor: string) {
    ctx.beginPath();
    ctx.arc(
        scaleX(ball.x, canvas),
        scaleY(ball.y, canvas),
        scaleX(ball.semidiameter, canvas), // or average if you prefer
        0,
        Math.PI * 2
    );
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}


export function renderGameCanvas(gameType: GameType.Multiplayer | GameType.Splitkeyboard | GameType.Tournament, canvas: HTMLCanvasElement, gameData?: WsDataLive, dimensions?: WsGameDataProperties) {
    
    const splitGameSettings : SplitKeyboardSettings = JSON.parse(localStorage.getItem('splitkeyboardSettings') || '{}');
    const paddleColor = gameType === GameType.Splitkeyboard ? splitGameSettings.paddle : '#000';
    const ballColor = gameType === GameType.Splitkeyboard ? splitGameSettings.ball : '#f00';
    
    resizeCanvas(canvas, dimensions);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    // default game render before any data is received from the server for drawing game structure
    if (!gameData)
    {
        drawNet(ctx, canvas);
        drawPaddles(ctx, [{ yCenter: 50, xCenter: 0.25, height: 25, width: 0.5}, { yCenter: 50, xCenter: 199.75 ,height: 25, width: 0.5}], canvas, paddleColor);
        drawBall(ctx, {x: 100, y: 50, semidiameter: 1}, canvas, ballColor)
    }
    // event driven handler - data received from the server
    else {
        drawNet(ctx, canvas);
        drawPaddles(ctx, gameData.paddles, canvas, paddleColor);
        drawBall(ctx, gameData.ball, canvas, ballColor);
    }
}