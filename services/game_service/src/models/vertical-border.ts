import {BoxType} from "../types/box.js";
import {Box} from "./box.js";

export enum BorderPosition {
    Left = 'left',
    Right = 'right',
}

export class VerticalBorder extends Box {
    position: BorderPosition;

    constructor(type: BoxType, x: number, y: number, width: number, height: number, vx: number, vy: number, position: BorderPosition) {
        super(type, x, y, width, height, vx, vy);
        this.position = position;
    }
}