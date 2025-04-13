import {BoxGeometry, BoxType} from "../types/box.js";

export class Box implements BoxGeometry {
    type: BoxType;
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    collidedThisTick: boolean;

    constructor(type: BoxType, x: number, y: number, width: number, height: number, vx: number, vy: number) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = vx;
        this.vy = vy;
        this.collidedThisTick = false;
    }

    move(time: number): void {
        this.x += this.vx * time;
        this.y += this.vy * time;
    }

    setVelocity(vx: number, vy: number): void {
        this.vx = vx;
        this.vy = vy;
    }
}