import {BoxGeometry} from "../types/box.js";
import {CollisionResult} from "../types/collision-result.js";

export function SweptAABB(b1: BoxGeometry, b2: BoxGeometry): CollisionResult {
    let xInvEntry: number, yInvEntry: number;
    let xInvExit: number, yInvExit: number;

    const relVx: number = b1.vx - b2.vx;
    const relVy: number = b1.vy - b2.vy;

    if (relVx > 0.0) {
        xInvEntry = (b2.x - b2.width / 2) - (b1.x + b1.width / 2);
        xInvExit = (b2.x + b2.width / 2) - (b1.x - b1.width / 2);
    } else {
        xInvEntry = (b2.x + b2.width / 2) - (b1.x - b1.width / 2);
        xInvExit = (b2.x - b2.width / 2) - (b1.x + b1.width / 2);
    }

    if (relVy > 0.0) {
        yInvEntry = (b2.y - b2.height / 2) - (b1.y + b1.height / 2);
        yInvExit = (b2.y + b2.height / 2) - (b1.y - b1.height / 2);
    } else {
        yInvEntry = (b2.y + b2.height / 2) - (b1.y - b1.height / 2);
        yInvExit = (b2.y - b2.height / 2) - (b1.y + b1.height / 2);
    }

    let xEntry: number, yEntry: number;
    let xExit: number, yExit: number;

    if (relVx === 0.0) {
        xEntry = Number.NEGATIVE_INFINITY;
        xExit = Number.POSITIVE_INFINITY;
    } else {
        xEntry = xInvEntry / relVx;
        xExit = xInvExit / relVx;
    }

    if (relVy === 0.0) {
        yEntry = Number.NEGATIVE_INFINITY;
        yExit = Number.POSITIVE_INFINITY;
    } else {
        yEntry = yInvEntry / relVy;
        yExit = yInvExit / relVy;
    }

    const entryTime: number = Math.max(xEntry, yEntry);
    const exitTime: number = Math.min(xExit, yExit);

    let normalX1: number = 0.0;
    let normalY1: number = 0.0;
    let normalX2: number = 0.0;
    let normalY2: number = 0.0;

    if (entryTime > exitTime || (xEntry < 0.0 && yEntry < 0.0) || xEntry > 1.0 || yEntry > 1.0) {
        return {time: 1.0, normalX1, normalY1, normalX2, normalY2};
    } else {
        if (xEntry > yEntry) {
            if (xInvEntry < 0.0) {
                normalX1 = 1.0;
                normalY1 = 0.0;
            } else {
                normalX1 = -1.0;
                normalY1 = 0.0;
            }
        } else {
            if (yInvEntry < 0.0) {
                normalX1 = 0.0;
                normalY1 = 1.0;
            } else {
                normalX1 = 0.0;
                normalY1 = -1.0;
            }
        }

        normalX2 = -normalX1;
        normalY2 = -normalY1;

        return {time: entryTime, normalX1, normalY1, normalX2, normalY2};
    }
}