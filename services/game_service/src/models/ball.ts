import {BALL_DIAMETER, BALL_INIT_SPEED, BALL_START_X, BALL_START_Y} from '../types/game-constants.js';
import {BallState} from "../types/ball.js";
import {Point} from "../types/point.js";


export class Ball {
    center: Point;
    prevCenter: Point;
    dx: number;
    dy: number;
    diameter: number;
    speed: number;

    constructor() {
        this.center = {x: BALL_START_X, y: BALL_START_Y};
        this.prevCenter = {x: BALL_START_X, y: BALL_START_Y};
        this.dx = -BALL_INIT_SPEED; // TODO: HARDCODED
        this.dy = -BALL_INIT_SPEED;
        this.diameter = BALL_DIAMETER;
        this.speed = BALL_INIT_SPEED;
    }

    horizontalBounce() {
        this.dy = -this.dy;
        this.center.y = Math.max(0 + BALL_DIAMETER/2, Math.min(100 - BALL_DIAMETER/2, this.center.y));
    }

    stop()
    {
        this.dx = 0;
        this.dy = 0;
    }

    update(): void {
        // Store previous position
        this.prevCenter.x = this.center.x;
        this.prevCenter.y = this.center.y;

        // Update position
        this.center.x += this.dx;
        this.center.y += this.dy;
    }

    reset(): void {
        this.center = {x: BALL_START_X, y: BALL_START_Y};
        this.prevCenter = {x: BALL_START_X, y: BALL_START_Y};
        this.dx = -BALL_INIT_SPEED; // TODO:HARDCODED
        this.dy = 0;
        this.speed = BALL_INIT_SPEED;
    }

    serialize(): BallState {
        return {
            x: this.center.x,
            y: this.center.y,
            semidiameter: this.diameter / 2
        };
    }
}