import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_INIT_POSITION, PADDLE_MOVE_STEP,
    PADDLE_WIDTH
} from "./game-constants.js";

export interface PaddleConfig {
    paddleWidth: number;
    paddleHeight: number;
    paddleMoveStep: number;
    initCenterY: number;
    canvasWidth: number;
    canvasHeight: number;
}

export const PADDLE_CONFIG: PaddleConfig = {
    paddleWidth: PADDLE_WIDTH,
    paddleHeight: PADDLE_HEIGHT,
    paddleMoveStep: PADDLE_MOVE_STEP,
    initCenterY: PADDLE_INIT_POSITION,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT
}