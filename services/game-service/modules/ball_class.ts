import { BallState, Point } from '../types/game.js';

import { BALL_DIAMETER, BALL_INIT_SPEED, BALL_MAX_SPEED, PADDLE_HEIGHT, PADDLE_WIDTH } from '../types/constants.js';


export class Ball {
    center: Point;
    prevCenter: Point;
    dx: number;
    dy: number;
    diameter: number;
    speed: number;

    constructor() {
        this.center = {x: 50, y: 50};
        this.prevCenter = {x: 50, y: 50};
        this.dx = -BALL_INIT_SPEED; // TODO: HARDCODED
        this.dy = 0;
        this.diameter = BALL_DIAMETER;
        this.speed = BALL_INIT_SPEED;
    }

    setPositions(prevX: number, prevY: number, x: number, y: number)
    {
        this.prevCenter.x = prevX;
        this.prevCenter.y = prevY;
        this.center.x = x;
        this.center.y = y;
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
        this.center = {x: 50, y: 50};
        this.prevCenter = {x: 50, y: 50};
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