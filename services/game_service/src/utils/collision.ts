import {BALL_SEMIDIAMETER} from "../types/game-constants.js";
import {Ball} from "../models/ball.js";
import {Paddle} from "../models/paddle.js";
import {
    getClosestPoint,
    getDistanceToLineSegment,
    getIntersectionPoint,
    isPointAboveLine
} from "./math-utils.js";
import {PaddleSide} from "../types/paddle.js";
import {CollisionPoint} from "../types/point.js";

function ballWithinPaddle(ball: Ball, paddle: Paddle) : boolean {

    return paddle.corners[0].x <= ball.center.x && ball.center.x <= paddle.corners[1].x;
}

export function computeMovingPaddleCollision(paddle: Paddle, ball: Ball): CollisionPoint | null {
    const withinX = ballWithinPaddle(ball, paddle);

    if (!withinX)
    {
        return null;
    }

    let possibleColisionPoints: CollisionPoint[] = [];
    let point: CollisionPoint;

    const cornerIndex = [0, 2];

    for(let i = 0; i < cornerIndex.length; i++) {
        const aboveLineNow = isPointAboveLine(paddle.corners[cornerIndex[i]], paddle.corners[cornerIndex[i] + 1], ball.center);
        const underLineBefore = !isPointAboveLine(paddle.prevCorners[cornerIndex[i]], paddle.prevCorners[cornerIndex[i] + 1], ball.prevCenter);

        if ((aboveLineNow && underLineBefore) || (!aboveLineNow && !underLineBefore))
        {
            point = {x: ball.center.x, y: paddle.corners[cornerIndex[i]].y, paddleSide: null}
            if (cornerIndex[i] === 0)
            {
                point.paddleSide = PaddleSide.Top;
                point.y -= 0.1; // TODO: LITTLE BIT HARDCODED
            }
            else if (cornerIndex[i] === 2)
            {
                point.paddleSide = PaddleSide.Bottom;
                point.y += 0.1; // TODO: LITTLE BIT HARDCODED
            }
            possibleColisionPoints.push(point);
        }
    };

    if (possibleColisionPoints.length === 1)
    {
        return (possibleColisionPoints[0]);
    }
    if (possibleColisionPoints.length === 2)
    {
        if (Math.abs(getDistanceToLineSegment(paddle.prevCorners[0],paddle.prevCorners[1], ball.prevCenter)) >=
        Math.abs(getDistanceToLineSegment(paddle.prevCorners[2],paddle.prevCorners[3], ball.prevCenter)))
        {
            return possibleColisionPoints[1];
        }
        else 
        {
            return possibleColisionPoints[0];
        }
    }

    return null;
}

export function computeCollisionPoint(paddle: Paddle, ball: Ball) : CollisionPoint | null
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
    return null;
}

