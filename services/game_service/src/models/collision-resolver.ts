import {EventEmitter} from "node:events";
import {Paddle} from "./paddle.js";
import {VerticalBorder} from "./vertical-border.js";
import {CollisionResult} from "../types/collision-result.js";
import {BoxType} from "../types/box.js";
import {Box} from "./box.js";

export class CollisionResolver {
    eventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    // TODO: implement the angle, speed up of the ball etc. from the Paddle/Ball objects
    resolve(collisions: { box1: Box | Paddle; box2: VerticalBorder | Box | Paddle; result: CollisionResult }[]): void {
        for (const {box1, box2, result} of collisions) {
            if (result.time >= 1.0) continue; // No collision within this tick

            if (box1.type === BoxType.Paddle && (box2.type === BoxType.HorizontalBorder)) {
                // Stop paddle at border by setting vy to 0 and adjusting position
                const time = result.time;
                box1.move(time); // Move to collision point
                box1.collidedThisTick = true;
            } else if (box1.type === BoxType.Ball && box2.type === BoxType.Paddle) {

                if (result.normalX2 === 1 || result.normalX2 === -1) {
                    // Bounce angle based on hit position
                    const speed = Math.sqrt(box1.vx * box1.vx + box1.vy * box1.vy);
                    const isLeftPaddle = box2.x < 50; // Left paddle at x=5
                    // Calculate hit position relative to paddle center
                    const hitOffset = (box1.y - box2.y) / (box2.height / 2); // -1 (top) to +1 (bottom)
                    // Clamp offset to [-1, 1] to handle edge cases
                    const clampedOffset = Math.max(-1, Math.min(1, hitOffset));
                    // Map offset to angle: 0° at center, ±75° at edges
                    const maxAngle = Math.PI * 75 / 180; // 75 degrees
                    const bounceAngle = clampedOffset * maxAngle; // -75° to +75°
                    // Compute new velocities
                    const newVx = (isLeftPaddle ? 1 : -1) * speed * Math.cos(bounceAngle);
                    const newVy = speed * Math.sin(bounceAngle);
                    box1.setVelocity(newVx, newVy);
                    if (box2 instanceof Paddle) {
                        this.eventEmitter.emit('PaddleBounce', box2.position);
                    }
                } else {
                    const time = result.time;
                    box1.move(time);
                    box1.setVelocity(box1.vx, -box1.vy);
                }
                box1.collidedThisTick = true;
            } else if (box1.type === BoxType.Ball && box2.type === BoxType.HorizontalBorder) {
                // Ball hits top/bottom border, reflect y-velocity
                const time = result.time;
                box1.move(time);
                box1.setVelocity(box1.vx, -box1.vy);
                box1.collidedThisTick = true;
            } else if (box1.type === BoxType.Ball && box2.type === BoxType.VerticalBorder) {
                // Ball hits left/right border, reflect x-velocity
                // const time = result.time;
                // box1.move(time);
                box1.setVelocity(-box1.vx, box1.vy);
                box1.x = 50;
                box1.y = 50;
                box1.collidedThisTick = true;
                if (box2 instanceof VerticalBorder) {
                    this.eventEmitter.emit('Score', box2.position);
                }
            }
        }
    }
}