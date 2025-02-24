import { BALL_SEMIDIAMETER } from "../types/constants.js";
import { Point, CollisionPoint, PaddleSide } from "../types/game.js"
import { Ball } from "./ball_class.js";
import { Paddle } from "./paddle_class.js";
import { getIntersectionPoint, getClosestPoint } from "./math_module.js";

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

function isPointAboveLine(firstPoint: Point, secondPoint: Point, pointToTest: Point): boolean {
    // Calculate the signed distance
    const value = (secondPoint.x - firstPoint.x) * (pointToTest.y - firstPoint.y) - (secondPoint.y - firstPoint.y) * (pointToTest.x - firstPoint.x);
    
    return value > 0;
  }

export function detectMovingPaddleCollsion(paddle: Paddle, ball: Ball): boolean {
    // TODO: ONLY FOR TOP HORIZONTAL EDGE OF PADDLE
    // Current paddle bounds
    const aboveTopNow = isPointAboveLine(paddle.corners[0], paddle.corners[1], ball.center); // Above top edge

    // Previous paddle bounds
    const aboveTopBefore = isPointAboveLine(paddle.prevCorners[0], paddle.prevCorners[1], ball.center);

    // Ball within horizontal bounds
    const withinX = paddle.corners[0].x <= ball.center.x && ball.center.x <= paddle.corners[1].x;

    const insideNow = !aboveTopNow
    const outsideBefore = aboveTopBefore
    
    if (withinX && insideNow && outsideBefore)
    {
        return (true);
    }
    else if (withinX && !insideNow && !outsideBefore)
    {
        return (true);
    }
    return (false);
}

export function calculateCollisionPoint(paddle: Paddle, ball: Ball) : CollisionPoint
{
	let CollisionPoints: CollisionPoint[] = []; // Array of point pairs

	paddle.corners.forEach((currentCorner, index) => {
		const nextCorner = paddle.corners[(index + 1) % paddle.corners.length];

		const intersectionPoint = getIntersectionPoint(currentCorner, nextCorner, ball.center, ball.prevCenter);
        if (intersectionPoint != null)
        {

            let possibleCollisionPoint: CollisionPoint = {...intersectionPoint, paddleSide: null};
            if (index === 0)
            {
                // top horizontal line
                possibleCollisionPoint.y -= BALL_SEMIDIAMETER * 0.01;
                possibleCollisionPoint.paddleSide = PaddleSide.Top;
            }
            else if (index === 1)
                {
                // right vertical line
                possibleCollisionPoint.x += BALL_SEMIDIAMETER * 0.01;
                possibleCollisionPoint.paddleSide = PaddleSide.Right;
            }
            else if (index === 2)
            {
                // bottom horizontal line
                possibleCollisionPoint.y += BALL_SEMIDIAMETER * 0.01;
                possibleCollisionPoint.paddleSide = PaddleSide.Bottom;
            }
            else if (index === 3)
            {
                // left verical line
                possibleCollisionPoint.x -= BALL_SEMIDIAMETER * 0.01; // TODO: hardcoded 0.01 could be problem with getClosestPoint
                possibleCollisionPoint.paddleSide = PaddleSide.Left;
            }
            CollisionPoints.push(possibleCollisionPoint);
        }
    });

    if (CollisionPoints.length === 1)
	{
		return CollisionPoints[0];
	}
	else if (CollisionPoints.length === 2)
	{
        return getClosestPoint(ball.prevCenter, CollisionPoints[0], CollisionPoints[1]);
	}
    else
    {
        throw 'Cannot find collision point.'
    }
}

