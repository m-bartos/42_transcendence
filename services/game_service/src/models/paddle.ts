import {PaddlePosition, PaddleState} from "../types/paddle.js";
import {PADDLE_CONFIG, PaddleConfig} from "../config/paddle-config.js";
import {Ball} from "./ball.js";
import {PaddleGeometry} from "./paddle-geometry.js"


export class Paddle extends PaddleGeometry{
    paddlePosition: PaddlePosition
    direction: number;
    config: PaddleConfig;

	constructor(paddlePosition: PaddlePosition,
                config: PaddleConfig = PADDLE_CONFIG
    )
    {
        const x = paddlePosition === PaddlePosition.Left ? config.paddleWidth / 2 : config.canvasWidth - config.paddleWidth / 2;
        super(config.paddleWidth, config.paddleHeight, x, config.initCenterY);
        this.config = config;
        this.paddlePosition = paddlePosition;
        this.direction = 0;
    }

    isAtTopEdge(): boolean {
        return this.getYOfTopEdge() < 0;
    }

    isAtBottomEdge(): boolean {
        return this.getYOfBottomEdge() > 100;
    }

    setDirection(direction: number): void
    {
        this.direction = Math.sign(direction);
    }

    update(): void {
        this.updatePrevPosition();

        this.move(this.direction * this.config.paddleMoveStep)

        if (this.isAtTopEdge()) {
            this.setPosition(this.config.paddleWidth / 2)
        }
        else if (this.isAtBottomEdge()) {
            this.setPosition(this.config.canvasHeight - this.config.paddleHeight / 2)
        }
    }

    isBallInsideVerticalEdges(ball: Ball): boolean {
        const rect = this.getCollisionBox(ball.semidiameter);
        return (
            ball.center.x >= rect.topLeft.x &&
            ball.center.x <= rect.topRight.x
        );
    }

    isBallInside(ball: Ball): boolean {
        const rect = this.getCollisionBox(ball.semidiameter);
        return (
            ball.center.x >= rect.topLeft.x &&
            ball.center.x <= rect.topRight.x &&
            ball.center.y >= rect.topLeft.y &&
            ball.center.y <= rect.bottomLeft.y
        );
    }

    serialize(): PaddleState {
        return {
            yCenter: this.getCenterY(),
            height: this.config.paddleHeight,
            width: this.config.paddleWidth
        };
    }
}