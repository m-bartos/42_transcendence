import {EventEmitter} from "node:events";

import {PaddlePosition, PaddleState} from "../types/paddle.js";
import {BallState} from "../types/ball.js";
import {BorderPosition, VerticalBorder} from "./vertical-border.js";
import {Box} from "./box.js";
import {Paddle} from "./paddle.js";
import {Ball} from "./ball.js";
import {CollisionResolver} from "./collision-resolver.js";
import {CollisionResult} from "../types/collision-result.js";
import {SweptAABB} from "../utils/swept-AABB.js";

import {GameEvents} from "../types/game-events.js";
import {CanvasConfig} from "../../config/canvas-config.js";
import {PaddleConfig} from "../../config/paddle-config.js";
import {BallConfig} from "../../config/ball-config.js";
import {BoxType} from "../types/box-type.js";

export class PhysicsEngine {
    private paddleOne: Paddle;
    private paddleTwo: Paddle;
    private ball: Ball;
    private topBorder: Box;
    private bottomBorder: Box;
    private leftBorder: VerticalBorder;
    private rightBorder: VerticalBorder;
    private resolver: CollisionResolver;
    private emitter: EventEmitter;


    constructor(
        emitter: EventEmitter,
        paddleConfig: PaddleConfig,
        ballConfig: BallConfig,
        canvas: CanvasConfig
        ) {

        this.emitter = emitter;

        this.paddleOne = new Paddle(paddleConfig.paddleWidth / 2, PaddlePosition.Left, paddleConfig);
        this.paddleTwo = new Paddle(canvas.width - paddleConfig.paddleWidth / 2, PaddlePosition.Right, paddleConfig);
        this.ball = new Ball(ballConfig); // Non-zero velocity for testing

        this.topBorder = new Box(BoxType.HorizontalBorder, canvas.width / 2, -0.5, canvas.width + 20, 1, 0, 0);
        this.bottomBorder = new Box(BoxType.HorizontalBorder, canvas.width / 2, canvas.height + 0.5, canvas.width + 20, 1, 0, 0);
        this.leftBorder = new VerticalBorder(BoxType.VerticalBorder, -2, canvas.height / 2, 1, canvas.height, 0, 0, BorderPosition.Left);
        this.rightBorder = new VerticalBorder(BoxType.VerticalBorder, canvas.width + 2, canvas.height / 2, 1, canvas.height, 0, 0, BorderPosition.Right);

        this.resolver = new CollisionResolver(emitter);

        this.initListeners();
    }

    //region Public methods
    update(): void {
        this.checkCollisions();
        this.updateNonCollisions();
    }

    serializePaddleOne(): PaddleState {
        return this.paddleOne.serialize();
    }

    serializePaddleTwo(): PaddleState {
        return this.paddleTwo.serialize();
    }

    serializeBall(): BallState {
        return this.ball.serialize();
    }

    stopAndReset(): void {
        this.paddleOne.init();
        this.paddleTwo.init();
        this.ball.reset();
        this.ball.stop();
    }

    destroy(): void {
        if (this.emitter)
        {
            this.destroyListeners();
        }

        this.paddleOne = null as any;
        this.paddleTwo = null as any;
        this.ball = null as any;

        this.topBorder = null as any;
        this.bottomBorder = null as any;
        this.leftBorder = null as any;
        this.rightBorder = null as any;

        this.resolver = null as any;
        this.emitter = null as any;
    }
    //endregion Public methods

    //region Private methods
    // only possibility? how to define the function and remove it in destroy()
    private movePaddleListener: ((position: PaddlePosition, direction: number) => void) = (position: PaddlePosition, direction: number) => {
        this.setMovePaddle(position, direction);
    }

    private initListeners(): void {
        this.emitter.addListener(GameEvents.MovePaddle, this.movePaddleListener);
    }

    private destroyListeners(): void {
        this.emitter.removeListener(GameEvents.MovePaddle, this.movePaddleListener);
    }

    private setMovePaddle(paddlePosition: PaddlePosition, direction: number): void {
        direction = Math.sign(direction);

        if (paddlePosition === PaddlePosition.Left) {
            this.paddleOne.setVelocity(0, direction);
        } else if (paddlePosition === PaddlePosition.Right) {
            this.paddleTwo.setVelocity(0, direction);
        }
    }

    private checkCollisions(): void {
        // Store all potential collisions
        const collisions: { box1: Box | Paddle; box2: Box | VerticalBorder | Paddle; result: CollisionResult }[] = [];


        // TODO: does not need to calculate the collision everytime. Add checker for that.
        // Check paddle collisions with borders
        collisions.push({
            box1: this.paddleOne,
            box2: this.topBorder,
            result: SweptAABB(this.paddleOne, this.topBorder),
        });
        collisions.push({
            box1: this.paddleOne,
            box2: this.bottomBorder,
            result: SweptAABB(this.paddleOne, this.bottomBorder),
        });
        collisions.push({
            box1: this.paddleTwo,
            box2: this.topBorder,
            result: SweptAABB(this.paddleTwo, this.topBorder),
        });
        collisions.push({
            box1: this.paddleTwo,
            box2: this.bottomBorder,
            result: SweptAABB(this.paddleTwo, this.bottomBorder),
        });

        // Check ball collisions with paddles
        collisions.push({
            box1: this.ball,
            box2: this.paddleOne,
            result: SweptAABB(this.ball, this.paddleOne),
        });
        collisions.push({
            box1: this.ball,
            box2: this.paddleTwo,
            result: SweptAABB(this.ball, this.paddleTwo),
        });

        // Check ball collisions with borders
        collisions.push({
            box1: this.ball,
            box2: this.topBorder,
            result: SweptAABB(this.ball, this.topBorder),
        });
        collisions.push({
            box1: this.ball,
            box2: this.bottomBorder,
            result: SweptAABB(this.ball, this.bottomBorder),
        });
        collisions.push({
            box1: this.ball,
            box2: this.leftBorder,
            result: SweptAABB(this.ball, this.leftBorder),
        });
        collisions.push({
            box1: this.ball,
            box2: this.rightBorder,
            result: SweptAABB(this.ball, this.rightBorder),
        });

        // Resolve all collisions after detection
        this.resolver.resolve(collisions);
    }

    private updateNonCollisions(): void {
        if (!this.paddleOne.collidedThisTick) {
            this.paddleOne.move(1);
        }
        if (!this.paddleTwo.collidedThisTick) {
            this.paddleTwo.move(1);
        }
        if (!this.ball.collidedThisTick) {
            this.ball.move(1);
        }
        this.paddleOne.collidedThisTick = false;
        this.paddleTwo.collidedThisTick = false;
        this.ball.collidedThisTick = false;
    }
    //endregion Private methods
}