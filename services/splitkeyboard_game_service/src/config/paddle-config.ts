import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_INIT_POSITION, PADDLE_MOVE_STEP,
    PADDLE_WIDTH
} from "./game-config.js";

export interface PaddleConfig {
    paddleWidth: number;
    paddleHeight: number;
    paddleMoveStep: number;
    initCenterY: number;
}

export const PADDLE_CONFIG: PaddleConfig = {
    paddleWidth: PADDLE_WIDTH,
    paddleHeight: PADDLE_HEIGHT,
    paddleMoveStep: PADDLE_MOVE_STEP,
    initCenterY: PADDLE_INIT_POSITION
}