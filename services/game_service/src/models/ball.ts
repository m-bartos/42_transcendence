import {
    BALL_DIAMETER,
    BALL_INIT_SPEED,
    BALL_MAX_SPEED,
    BALL_SPEED_INCREMENT,
    BALL_START_X,
    BALL_START_Y
} from '../types/game-constants.js';
import {BallState} from "../types/ball.js";
import {Point} from "../types/point.js";


export class Ball {
    _center: Point;
    prevCenter: Point;
    dx: number;
    dy: number;
    diameter: number;
    speed: number;

    constructor() {
        this._center = {x: BALL_START_X, y: BALL_START_Y};
        this.prevCenter = {x: BALL_START_X, y: BALL_START_Y};
        this.dx = -BALL_INIT_SPEED; // TODO: HARDCODED
        this.dy = -BALL_INIT_SPEED;
        this.diameter = BALL_DIAMETER;
        this.speed = BALL_INIT_SPEED;
    }

    get semidiameter():number {
        return this.diameter / 2;
    }

    get centerX(): number {
        return this._center.x;
    }

    get centerY(): number {
        return this._center.y;
    }

    get center(): Point {
        return this._center;
    }

    set center(newCenter: Point) {
        this._center = {...newCenter};
    }

    horizontalBordersBounce() {
        this.horizontalBounce();
        this._center.y = Math.max(0 + BALL_DIAMETER/2, Math.min(100 - BALL_DIAMETER/2, this._center.y));
    }

    horizontalBounce() {
        this.dy = -this.dy;
    }

    paddleBounce() {

    }

    speedUp() {
        this.speed = Math.min(this.speed * BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
        console.log(this.speed);
    }

    stop()
    {
        this.dx = 0;
        this.dy = 0;
    }

    update(): void {
        // Store previous position
        this.prevCenter.x = this._center.x;
        this.prevCenter.y = this._center.y;

        // Update position
        this._center.x += this.dx;
        this._center.y += this.dy;
    }

    reset(): void {
        this._center = {x: BALL_START_X, y: BALL_START_Y};
        this.prevCenter = {x: BALL_START_X, y: BALL_START_Y};
        this.dx = -BALL_INIT_SPEED; // TODO:HARDCODED
        this.dy = 0;
        this.speed = BALL_INIT_SPEED;
    }

    serialize(): BallState {
        return {
            x: this._center.x,
            y: this._center.y,
            semidiameter: this.diameter / 2
        };
    }
}