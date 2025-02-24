import { Point } from "../types/game.js"


export function getIntersectionPoint(line1Start: Point, line1End: Point, line2Start: Point, line2End: Point): Point | null {
    // Line 1 represented as a1x + b1y = c1
    const a1 = line1End.y - line1Start.y;
    const b1 = line1Start.x - line1End.x;
    const c1 = a1 * line1Start.x + b1 * line1Start.y;

    // Line 2 represented as a2x + b2y = c2
    const a2 = line2End.y - line2Start.y;
    const b2 = line2Start.x - line2End.x;
    const c2 = a2 * line2Start.x + b2 * line2Start.y;

    // Determinant
    const determinant = a1 * b2 - a2 * b1;

    // If lines are parallel, no intersection point
    if (determinant === 0) {
        return null;
    }

    // Calculate intersection point
    const x = (b2 * c1 - b1 * c2) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;

    if (isPointOnLineSegment(line1Start, line1End, {x, y}) &&
        isPointOnLineSegment(line2Start, line2End, {x, y})) {
        return {x, y};
    }

    return null;
}

function isPointOnLineSegment(lineStart: Point, lineEnd: Point, point: Point): boolean {
    const epsilon = 1e-6; // Adjust this based on your precision needs

    // Check collinearity using the area of the triangle (cross product)
    const area = Math.abs(
        (lineEnd.x - lineStart.x) * (point.y - lineStart.y) -
        (point.x - lineStart.x) * (lineEnd.y - lineStart.y)
    );

    // If area is greater than epsilon, point is not collinear
    if (area > epsilon) {
        return false;
    }

    // Check bounds with epsilon tolerance
    const minX = Math.min(lineStart.x, lineEnd.x);
    const maxX = Math.max(lineStart.x, lineEnd.x);
    const minY = Math.min(lineStart.y, lineEnd.y);
    const maxY = Math.max(lineStart.y, lineEnd.y);

    return point.x + epsilon >= minX &&
           point.x - epsilon <= maxX &&
           point.y + epsilon >= minY &&
           point.y - epsilon <= maxY;
}


export function getClosestPoint<T extends Point>(pointA: Point, pointB: T, pointC: T): T {
    const distanceToB = calculateDistance(pointA, pointB);
    const distanceToC = calculateDistance(pointA, pointC);

    return distanceToB < distanceToC ? pointB : pointC;
}

export function calculateDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);  // Euclidean distance
}
