import { BallState } from '../types/game.js';

export class Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    size: number;

    constructor() {
        this.x = 50;
        this.y = 50;
        this.dx = 0;
        this.dy = 0;
        this.size = 10;
    }

    update(): void {
        this.x += this.dx;
        this.y += this.dy;
    }

    reset(): void {
        this.x = 50;
        this.y = 50;
        this.dx = 0;
        this.dy = 0;
    }

    serialize(): BallState {
        return {
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy,
            size: this.size
        };
    }
}