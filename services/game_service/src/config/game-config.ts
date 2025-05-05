import {EventEmitter} from "node:events";

import {PhysicsEngine} from "../pong-game/models/physics-engine.js";

export const GAME_MAX_SCORE = 10;

export const CANVAS_WIDTH = 200;
export const CANVAS_HEIGHT = 100;

export const PADDLE_INIT_POSITION = 50;
export const PADDLE_MOVE_STEP = 1.3;
export const PADDLE_WIDTH = 0.5; // X % of field width
export const PADDLE_HEIGHT = 25;  // X % of field height


export const BALL_SEMIDIAMETER = 1; // this we agreed on
export const BALL_DIAMETER = BALL_SEMIDIAMETER * 2;
export const BALL_INIT_SPEED = 1.1; // 0.5 - 0.9 for start
export const BALL_SPEED_INCREMENT = 1.1; // 10% speed increase per hit
export const BALL_MAX_SPEED = 2; // till 1.5-2 playable
export const BALL_START_X = CANVAS_WIDTH / 2;
export const BALL_START_Y = CANVAS_HEIGHT / 2;

export const GAME_TIMEOUT = 60; // in seconds
export const MAX_BOUNCE_ANGLE_IN_RADS = Math.PI / 4; // 75 deg

export interface GameConfig {
    gameTimeout: number;
    maxScore: number;
}