import {EventEmitter} from "node:events";

import {PADDLE_CONFIG, PaddleConfig} from "../config/paddle-config.js";
import {BALL_CONFIG, BallConfig} from "../config/ball-config.js";
import {CANVAS_CONFIG, CanvasConfig} from "../config/canvas-config.js";

import {PaddlePosition, PaddleState} from "../types/paddle.js";
import {BallState} from "../types/ball.js";
import {BorderPosition, VerticalBorder} from "./vertical-border.js";
import {Box} from "./box.js";
import {BoxType} from "../types/box.js";
import {Paddle} from "./paddle.js";
import {Ball} from "./ball.js";
import {CollisionResolver} from "./collision-resolver.js";
import {CollisionResult} from "../types/collision-result.js";
import {SweptAABB} from "../utils/swept-AABB.js";

export class PhysicsEngine extends EventEmitter {
    paddleOne: Paddle;
    paddleTwo: Paddle;
    ball: Ball;
    topBorder: Box;
    bottomBorder: Box;
    leftBorder: VerticalBorder;
    rightBorder: VerticalBorder;
    resolver: CollisionResolver;


    constructor(
        paddleConfig: PaddleConfig = PADDLE_CONFIG,
        ballConfig: BallConfig = BALL_CONFIG,
        canvas: CanvasConfig = CANVAS_CONFIG
    ) {
        super();
        this.paddleOne = new Paddle(paddleConfig.paddleWidth / 2, PaddlePosition.Left, paddleConfig);
        this.paddleTwo = new Paddle(canvas.width - paddleConfig.paddleWidth / 2, PaddlePosition.Right, paddleConfig);
        this.ball = new Ball(BALL_CONFIG); // Non-zero velocity for testing

        this.topBorder = new Box(BoxType.HorizontalBorder, canvas.height / 2, -0.5, canvas.width + 20, 1, 0, 0);
        this.bottomBorder = new Box(BoxType.HorizontalBorder, canvas.height / 2, canvas.height + 0.5, canvas.width + 20, 1, 0, 0);
        this.leftBorder = new VerticalBorder(BoxType.VerticalBorder, -2, canvas.height / 2, 1, canvas.height, 0, 0, BorderPosition.Left);
        this.rightBorder = new VerticalBorder(BoxType.VerticalBorder, canvas.width + 2, canvas.height / 2, 1, canvas.height, 0, 0, BorderPosition.Right);
        this.resolver = new CollisionResolver(this);

        this.initListeners();
    }

    initListeners(): void {
        this.addListener('MovePaddle', function (this: PhysicsEngine, paddlePosition: PaddlePosition, side: number): void {
            if (paddlePosition === PaddlePosition.Left) {
                this.paddleOne.setVelocity(0, side);
            } else if (paddlePosition === PaddlePosition.Right) {
                this.paddleTwo.setVelocity(0, side);
            }
        });
    }

    checkCollisions(): void {
        // Store all potential collisions
        const collisions: { box1: Box | Paddle; box2: Box | VerticalBorder | Paddle; result: CollisionResult }[] = [];


        // TODO: does not need to callculate the collision everytime. Add checker for that.
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

    updateNonCollisions(): void {
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

    // Update game state for the tick
    update(): void {
        // Reset velocities for paddles based on input (example)
        // For simplicity, assume paddles are controlled separately
        // this.paddleOne.setVelocity(0, inputPaddleOneVy);
        // this.paddleTwo.setVelocity(0, inputPaddleTwoVy);

        // Perform collision checks and resolutions
        this.checkCollisions();
        this.updateNonCollisions();

        // Move objects that weren't handled by collisions
        // Since collisions move objects to contact points, this is optional
        // or can be adjusted based on your game loop
        // this.paddleOne.move(deltaTime);
        // this.paddleTwo.move(deltaTime);
        // this.ball.move(deltaTime);
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
}