import {
    BALL_DIAMETER,
    BALL_INIT_SPEED,
    BALL_MAX_SPEED,
    BALL_SPEED_INCREMENT,
    BALL_START_X,
    BALL_START_Y,
    CANVAS_HEIGHT,
    CANVAS_WIDTH, MAX_BOUNCE_ANGLE_IN_RADS
} from "./game-config.js";

export interface BallConfig {
    centerX: number;
    centerY: number;
    diameter: number;
    initialSpeed: number;
    speedIncrement: number;
    maxSpeed: number;
    maxBounceAngle: number;
    canvasHeight: number;
    canvasWidth: number;
}

export const BALL_CONFIG: BallConfig = {
    centerX: BALL_START_X,
    centerY: BALL_START_Y,
    diameter: BALL_DIAMETER,
    initialSpeed: BALL_INIT_SPEED,
    speedIncrement: BALL_SPEED_INCREMENT,
    maxSpeed: BALL_MAX_SPEED,
    maxBounceAngle: MAX_BOUNCE_ANGLE_IN_RADS,
    canvasHeight: CANVAS_HEIGHT,
    canvasWidth: CANVAS_WIDTH,
}