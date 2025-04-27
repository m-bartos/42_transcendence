import {BallConfig} from "../../config/ball-config.js";
import {BallState} from "../types/ball.js";
import {Box} from "./box.js";
import {BoxType} from "../types/box-type.js";

export class Ball extends Box {
    config: BallConfig;
    speed: number;

    constructor(config: BallConfig) {
        super(BoxType.Ball, config.centerX, config.centerY, config.diameter, config.diameter, 0, 0);
        this.config = config;

        // is it testable if I set vx, vy randomly?
        const speedVector = this.initSpeedVector(config.initialSpeed, config.maxBounceAngle);
        this.vx = speedVector.vx;
        this.vy = speedVector.vy;
        this.speed = config.initialSpeed;
    }

    initSpeedVector(initSpeed: number, maxBounceAngle: number): { vx: number, vy: number } {
        const angle = (Math.random() * 2 - 1) * maxBounceAngle;

        const direction = Math.random() < 0.5 ? -1 : 1;

        // Calculate dx and dy based on speed, angle, and direction
        this.vx = direction * initSpeed * Math.cos(Math.abs(angle));
        this.vy = initSpeed * Math.sin(angle);

        // TESTING PURPOSE
        this.vx = -this.config.initialSpeed;
        this.vy = 0;

        return {vx: this.vx, vy: this.vy};
    }

    reset(): void {
        this.x = this.config.centerX;
        this.y = this.config.centerY;
        this.speed = this.config.initialSpeed;
        this.initSpeedVector(this.config.initialSpeed, this.config.maxBounceAngle);
    }

    speedUp() {
        this.speed = Math.min(this.speed * this.config.speedIncrement, this.config.maxSpeed);
    }

    stop() {
        this.vx = 0;
        this.vy = 0;
    }

    serialize(): BallState {
        return {
            x: this.x,
            y: this.y,
            semidiameter: this.width / 2
        };
    }
}