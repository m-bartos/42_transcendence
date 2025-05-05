import {EventEmitter} from "node:events";
import {Paddle} from "./paddle.js";
import {VerticalBorder} from "./vertical-border.js";
import {CollisionResult} from "../types/collision-result.js";
import {Box} from "./box.js";
import {BoxType} from "../types/box-type.js";
import {Ball} from "./ball.js";
import {PaddlePosition} from "../types/paddle.js";
import {GameEvents} from "../types/game-events.js";


// This could also be written as a function with closure
export class CollisionResolver {
    private eventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    resolve(collisions: { box1: Box | Paddle | Ball; box2: VerticalBorder | Box | Paddle; result: CollisionResult }[]): void {
        for (const {box1, box2, result} of collisions) {
            if (result.time >= 1.0) continue; // No collision within this tick

            if (box1.type === BoxType.Paddle && (box2.type === BoxType.HorizontalBorder)) {
                // Stop paddle at border by setting vy to 0 and adjusting position
                const time = result.time;
                box1.move(time); // Move to collision point
                box1.collidedThisTick = true;
            } else if (box1.type === BoxType.Ball && box2.type === BoxType.Paddle) {

                if (result.normalX2 === 1 || result.normalX2 === -1) {
                    if (box1 instanceof Ball && box2 instanceof Paddle)
                    {
                        box1.move(result.time);
                        // Bounce angle based on hit position
                        box1.speedUp();
                        const speed = box1.speed;
                        // Calculate hit position relative to paddle center
                        const hitOffset = (box1.y - box2.y) / (box2.height / 2);
                        const clampedOffset = Math.max(-1, Math.min(1, hitOffset));
                        const bounceAngle = clampedOffset * box1.config.maxBounceAngle;
                        // Compute new velocities
                        const isLeftPaddle = box2.position === PaddlePosition.Left;
                        const newVx = (isLeftPaddle ? 1 : -1) * speed * Math.cos(bounceAngle);
                        const newVy = speed * Math.sin(bounceAngle);
                        box1.setVelocity(newVx, newVy);
                        this.eventEmitter.emit(GameEvents.PaddleBounce, box2.position);
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
                if (box1 instanceof Ball)
                {
                    box1.reset();
                    box1.collidedThisTick = true;
                }
                if (box2 instanceof VerticalBorder) {
                    this.eventEmitter.emit('Score', box2.position);
                }
            }
        }
    }
}