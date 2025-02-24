import { BallState, Point } from '../types/game.js';

import { BALL_DIAMETER, BALL_SPEED, BALL_MAX_SPEED, PADDLE_HEIGHT, PADDLE_WIDTH } from '../types/constants.js';


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
        this.dx = BALL_SPEED; // TODO: HARDCODED
        this.dy = 0;
        this.diameter = BALL_DIAMETER;
        this.speed = BALL_SPEED;
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

    // start(): void {
    //     // Random initial direction
    //     const angle = (Math.random() * Math.PI / 4) + Math.PI / 8; // Angle between PI/8 and 3PI/8
    //     const direction = Math.random() < 0.5 ? 1 : -1; // Random initial direction (left or right)
        
    //     // Set velocity based on angle and speed
    //     this.dx = this.speed * direction * Math.cos(angle);
    //     this.dy = this.speed * Math.sin(angle);
    // }

	// TESTING 
	// start(): void {
    //     // Random initial direction
    //     const angle = 0;
    //     const direction = -1;
        
    //     // Set velocity based on angle and speed
    //     this.dx = this.speed * direction * Math.cos(angle);
    //     this.dy = this.speed * Math.sin(angle);
    // }

    update(): void {
        // Store previous position
        this.prevCenter.x = this.center.x;
        this.prevCenter.y = this.center.y;

        // Update position
        this.center.x += this.dx;
        this.center.y += this.dy;

        // Bounce off top and bottom walls (0-100 space)
        if (this.center.y <= (0 + BALL_DIAMETER/2) || this.center.y >= (100 - BALL_DIAMETER/2) ) {
            this.dy = -this.dy;
            this.center.y = Math.max(0 + BALL_DIAMETER/2, Math.min(100 - BALL_DIAMETER/2, this.center.y));
        }
    }

    reset(): void {
        this.center.x = 50;
        this.center.y = 50;
        this.prevCenter.x = 50;
        this.prevCenter.y = 50;
        this.dx = BALL_SPEED; // TODO:HARDCODED
        this.dy = 0;
        this.speed = BALL_SPEED;
    }

    serialize(): BallState {
        return {
            x: this.center.x,
            y: this.center.y,
            prevX: this.prevCenter.x,
            prevY: this.prevCenter.y,
            dx: this.dx,
            dy: this.dy,
            size: this.diameter
        };
    }
}