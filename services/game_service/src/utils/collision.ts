import {BALL_SEMIDIAMETER} from "../types/game-constants.js";
import {Ball} from "../models/ball.js";
import {Paddle} from "../models/paddle.js";
import {getClosestPoint, getDistanceToLineSegment, getIntersectionPoint, isPointAboveLine} from "./math-utils.js";
import {RectangleSide} from "../types/paddle.js";
import {CollisionPoint} from "../types/point.js";

export function computeMovingPaddleCollisionPoint(paddle: Paddle, ball: Ball): CollisionPoint | null {

    if (!paddle.isPointInsideVerticalEdges(ball.center)) {
        return null;
    }

    const possibleCollisionPoints: CollisionPoint[] = [];
    const edges = paddle.getCollisionBox(BALL_SEMIDIAMETER).toEdges();
    const prevEdges = paddle.getPrevCollisionBox(BALL_SEMIDIAMETER).toEdges();


    // Check top and bottom edges (indices 0 and 2)
    // const horizontalEdgeIndices = [0, 2];
    const horizontalEdges = edges.filter(edge => edge.side === RectangleSide.Top || edge.side === RectangleSide.Bottom);
    const horizontalPrevEdges = prevEdges.filter(edge => edge.side === RectangleSide.Top || edge.side === RectangleSide.Bottom);


    for (let i = 0; i < horizontalPrevEdges.length; i++) {
        const edge = horizontalEdges[i];
        const prevEdge = horizontalPrevEdges[i];

        const aboveLineNow = isPointAboveLine(edge.start, edge.end, ball.center);
        const underLineBefore = !isPointAboveLine(prevEdge.start, prevEdge.end, ball.prevCenter);

        if ((aboveLineNow && underLineBefore) || (!aboveLineNow && !underLineBefore)) {
            const collisionPoint: CollisionPoint = {
                x: ball.center.x,
                y: edge.start.y,
                paddleSide: edge.side
            };

            // Adjust y to prevent overlap
            const offset = 0.1; // Constant for slight adjustment
            if (edge.side === RectangleSide.Top) {
                collisionPoint.y -= offset;
            } else if (edge.side === RectangleSide.Bottom) {
                collisionPoint.y += offset;
            }

            possibleCollisionPoints.push(collisionPoint);
        }
    }

    if (possibleCollisionPoints.length === 1) {
        return possibleCollisionPoints[0];
    }
    if (possibleCollisionPoints.length === 2) {
        // Choose the closest point based on previous ball position
        const topEdgeDistance = Math.abs(prevEdges[0].pointDistance(ball.prevCenter));
        const bottomEdgeDistance = Math.abs(prevEdges[2].pointDistance(ball.prevCenter));

        return topEdgeDistance >= bottomEdgeDistance
            ? possibleCollisionPoints[1] // Bottom
            : possibleCollisionPoints[0]; // Top
    }

    return null;
}

export function computeCollisionPoint(paddle: Paddle, ball: Ball): CollisionPoint | null {
    const collisionPoints: CollisionPoint[] = [];
    const edges = paddle.getCollisionBox(BALL_SEMIDIAMETER).toEdges();

    for (const edge of edges) {
        const intersectionPoint = getIntersectionPoint(
            edge.start,
            edge.end,
            ball.center,
            ball.prevCenter
        );

        if (intersectionPoint) {
            const offset = BALL_SEMIDIAMETER * 0.01; // Small adjustment to prevent overlap
            const collisionPoint: CollisionPoint = {
                ...intersectionPoint,
                paddleSide: edge.side
            };

            // Adjust collision point based on paddle side
            switch (edge.side) {
                case RectangleSide.Top:
                    collisionPoint.y -= offset;
                    break;
                case RectangleSide.Right:
                    collisionPoint.x += offset;
                    break;
                case RectangleSide.Bottom:
                    collisionPoint.y += offset;
                    break;
                case RectangleSide.Left:
                    collisionPoint.x -= offset;
                    break;
            }

            collisionPoints.push(collisionPoint);
        }
    }

    if (collisionPoints.length === 1) {
        return collisionPoints[0];
    }
    if (collisionPoints.length === 2) {
        return getClosestPoint(ball.prevCenter, collisionPoints[0], collisionPoints[1]);
    }

    return null;
}
