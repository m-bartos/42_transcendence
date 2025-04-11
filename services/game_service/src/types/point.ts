import {RectangleSide} from "./paddle.js";

export interface CollisionPoint extends Point {
    paddleSide: RectangleSide | null
}

export interface Point {
    x: number;
    y: number;
}