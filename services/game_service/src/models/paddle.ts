import {PaddlePosition, PaddleState} from "../types/paddle.js";
import {PaddleConfig} from "../config/paddle-config.js";
import {BoxType} from "../types/box.js";
import {Box} from "./box.js";

export class Paddle extends Box {
    position: PaddlePosition;
    config: PaddleConfig;

    constructor(x: number, paddlePosition: PaddlePosition, config: PaddleConfig) {
        super(BoxType.Paddle, x, config.initCenterY, config.paddleWidth, config.paddleHeight, 0, 0);
        this.position = paddlePosition;
        this.config = config;
    }

    init() {
        this.y = this.config.initCenterY;
    }

    serialize(): PaddleState {
        return {
            yCenter: this.y,
            height: this.config.paddleHeight,
            width: this.config.paddleWidth
        };
    }
}