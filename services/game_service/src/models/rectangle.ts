import {RectangleEdge} from "./edge.js";
import {Point} from "../types/point.js";
import {RectangleSide} from "../types/paddle.js";


export class Rectangle {
    constructor(
        public topLeft: Point,
        public topRight: Point,
        public bottomRight: Point,
        public bottomLeft: Point
    ) {}

    toArrayOfPoints(): Point[] {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
    }

    toArrayOfEdges(): RectangleEdge[] {
        return [new RectangleEdge(this.topLeft, this.topRight, RectangleSide.Top),
            new RectangleEdge(this.topRight, this.bottomRight, RectangleSide.Right),
            new RectangleEdge(this.bottomRight, this.bottomLeft, RectangleSide.Bottom),
            new RectangleEdge(this.bottomLeft, this.topLeft, RectangleSide.Left)
        ]
    }
}