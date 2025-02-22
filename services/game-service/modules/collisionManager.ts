import { BALL_SEMIDIAMETER } from "../types/constants.js";
import { Point } from "../types/game.js"
import { Ball } from "./ball_class.js";
import { Paddle } from "./paddle_class.js";

function getIntersectionPoint(line1Start: Point, line1End: Point, line2Start: Point, line2End: Point): Point | null {
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

    // Check if intersection point lies within both line segments
    const isOnLine1 = isPointOnLineSegment(line1Start, line1End, {x, y});
    const isOnLine2 = isPointOnLineSegment(line2Start, line2End, {x, y});

    if (isPointOnLineSegment(line1Start, line1End, {x, y}) &&
        isPointOnLineSegment(line2Start, line2End, {x, y})) {
        return {x, y};
    }

    return null;
}

function isPointOnLineSegment(lineStart: Point, lineEnd: Point, point: Point): boolean {
    const epsilon = 1e-10; // Adjust this based on your precision needs

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

export function ballCollideWithPaddle(paddle: Paddle, ball: Ball): boolean {
    for (let i = 0; i < paddle.corners.length; i++) {
        const currentCorner = paddle.corners[i];
        const nextCorner = paddle.corners[(i + 1) % paddle.corners.length];
        if (getIntersectionPoint(currentCorner, nextCorner, ball.center, ball.prevCenter) != null) {
            return true;
        }
    }
    return false;
}

// export function ballCollideWithPaddle(paddle: Paddle, ball: Ball): boolean {
//     // console.log('Ball: current = [', ball.center, '], prev = [', ball.prevCenter, ']');
    
//     // Calculate ball movement direction
//     const movingRight = ball.dx > 0;

//     // Paddle corners in order: [top-left, top-right, bottom-right, bottom-left]
//     const topLeft = paddle.corners[0];
//     const topRight = paddle.corners[1];
//     const bottomRight = paddle.corners[2];
//     const bottomLeft = paddle.corners[3];

//     // Verify corner ordering (optional debugging)
//     // console.log('Corners: TL=', topLeft, 'TR=', topRight, 'BR=', bottomRight, 'BL=', bottomLeft);

//     // Determine paddle identity (left or right paddle)
//     const paddleCenterX = (topLeft.x + topRight.x + bottomRight.x + bottomLeft.x) / 4;
//     const isLeftPaddle = paddleCenterX < 50; // Assuming 100x100 screen, adjust if needed

//     // Check the correct side based on paddle and ball direction
//     if (isLeftPaddle && !movingRight) {
//         console.log('left paddle collision check')
//         // Left paddle (Paddle1), ball moving right: check right sideСтрока (1-2)
//         const intersection = getIntersectionPoint(bottomRight, topRight, ball.prevCenter, ball.center);
//         if (intersection != null) {
//             console.log('Intersect check true - right side of left paddle');
//             return true;
//         }
//     } else if (!isLeftPaddle && movingRight) {
//         // Right paddle (Paddle2), ball moving left: check left side (0-3)
//         const intersection = getIntersectionPoint(topLeft, bottomLeft, ball.center, ball.prevCenter);
//         if (intersection != null) {
//             console.log('Intersect check true - left side of right paddle');
//             return true;
//         }
//     }
    
//     return false;
// }

export function calculateCollisionPoint(paddle: Paddle, ball: Ball) : Point
{
	let possibleIntersectPoints: Point[] = []; // Array of point pairs

	paddle.corners.forEach((currentCorner, index) => {
		const nextCorner = paddle.corners[(index + 1) % paddle.corners.length];

		const currentPossibleIntersectionPoint = getIntersectionPoint(currentCorner, nextCorner, ball.center, ball.prevCenter);
		if (currentPossibleIntersectionPoint != null)
		{
            if (index === 0)
            {
                // top horizontal line
                currentPossibleIntersectionPoint.y += BALL_SEMIDIAMETER;
            }
            else if (index === 1)
            {
                // right vertical line
                currentPossibleIntersectionPoint.x -= BALL_SEMIDIAMETER;
            }
            if (index === 2)
            {
                // bottom horizontal line
                currentPossibleIntersectionPoint.y -= BALL_SEMIDIAMETER;
            }
            else if (index === 3)
            {
                // left verical line
                currentPossibleIntersectionPoint.x += BALL_SEMIDIAMETER;
            }
			possibleIntersectPoints.push(currentPossibleIntersectionPoint);
        }
	});

    if (possibleIntersectPoints.length === 1)
	{
		return possibleIntersectPoints[0];
	}
	else if (possibleIntersectPoints.length === 2)
	{
		return getClosestPoint(ball.prevCenter, possibleIntersectPoints[0], possibleIntersectPoints[1]);
	}
    else
    {
        throw 'Cannot find collision point.'
    }
}

function getClosestPoint(pointA: Point, pointB: Point, pointC: Point): Point {
    // Calculate distances from A to B and A to C
    const distanceToB = calculateDistance(pointA, pointB);
    const distanceToC = calculateDistance(pointA, pointC);

    // Return the point with shorter distance
    return distanceToB < distanceToC ? pointB : pointC;
}

function calculateDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);  // Euclidean distance
}

