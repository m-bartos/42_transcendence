import {Point} from "../types/point.js";
import {RectangleSide} from "../types/paddle.js";

export class Edge{
    start: Point;
    end: Point;

    constructor( start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }

    distanceToPoint(pointToMeasure: Point): number {
        // Vector from p1 to p2
        const dx = this.end.x - this.start.x;
        const dy = this.end.y - this.start.y;
        const lenSquared = dx * dx + dy * dy;

        // If p1 and p2 are the same point, return distance to p1
        if (lenSquared === 0) {
            const distX = pointToMeasure.x - this.start.x;
            const distY = pointToMeasure.y - this.start.y;
            return Math.sqrt(distX * distX + distY * distY);
        }

        // Project p onto the line, clamping t to [0, 1] for segment bounds
        let t = ((pointToMeasure.x - this.start.x) * dx + (pointToMeasure.y - this.start.y) * dy) / lenSquared;
        t = Math.max(0, Math.min(1, t)); // Clamp to segment

        // Find the closest point on the segment
        const closest = {
            x: this.start.x + t * dx,
            y: this.start.y + t * dy
        };

        // Calculate Euclidean distance from p to the closest point
        const distX = pointToMeasure.x - closest.x;
        const distY = pointToMeasure.y - closest.y;
        return Math.sqrt(distX * distX + distY * distY);
    }

    isPointAbove(pointToTest: Point): boolean {
        // Calculate the signed distance
        const value = (this.end.x - this.start.x) * (pointToTest.y - this.start.y) - (this.end.y - this.start.y) * (pointToTest.x - this.start.x);

        return value > 0;
    }
}

export class RectangleEdge extends Edge{
    constructor(
        start: Point,
        end: Point,
        public side: RectangleSide
    )
    {super(start, end)}
}