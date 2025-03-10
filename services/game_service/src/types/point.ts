import {PaddleSide} from "./paddle.js";

export interface CollisionPoint extends Point {
    paddleSide: PaddleSide | null
}

export interface Point {
    x: number;
    y: number;
}