import { PADDLE_HEIGHT, PADDLE_MOVE_STEP, PADDLE_WIDTH, BALL_SEMIDIAMETER, PADDLE_INIT_Y_TOP, PADDLE_INIT_Y_BOTTOM } from '../types/game-constants.js';

import {PaddlePosition as PaddleType, PaddleState} from "../types/paddle.js";
import {Point} from "../types/point.js";

export class Paddle {
    paddleType: PaddleType
    corners: Point[];
    prevCorners: Point[];
    direction: number;

    // TODO: corners should be the right paddle corners. Would be nice if the BALL boundary can be added somehow so it will be more clear what is going on 
	constructor(paddleType: PaddleType) {
        
        const yTop = PADDLE_INIT_Y_TOP;
        const yBottom = PADDLE_INIT_Y_BOTTOM;
        this.direction = 0;
        
        this.paddleType = paddleType;

        if (paddleType === PaddleType.Left)
        {
            this.corners = [{x: 0 - BALL_SEMIDIAMETER, y: yTop}, // top left
                            {x: 0 + PADDLE_WIDTH + BALL_SEMIDIAMETER, y: yTop}, // top right
                            {x: 0 + PADDLE_WIDTH + BALL_SEMIDIAMETER, y: yBottom}, // bottom right
                            {x: 0 - BALL_SEMIDIAMETER, y: yBottom}]; // bottom left
        }
        else
        {
            this.corners = [{x: 100 - PADDLE_WIDTH - BALL_SEMIDIAMETER, y: yTop},
                            {x: 100 + BALL_SEMIDIAMETER, y: yTop},
                            {x: 100 + BALL_SEMIDIAMETER, y: yBottom},
                            {x: 100 - PADDLE_WIDTH - BALL_SEMIDIAMETER, y: yBottom}];
        }
        this.prevCorners = this.corners.map(point => ({ ...point }));
    }

    getCenterY(): number
    {
        return this.corners.reduce((sum, point) => sum + point.y, 0) / this.corners.length;
    }

    paddleOnEdge(direction: number)
    {
        if (direction < 0)
        {
            return (this.corners[0].y + BALL_SEMIDIAMETER <= 0);
        }
        else if (direction > 0)
        {
            return (this.corners[3].y - BALL_SEMIDIAMETER >= 100);
        }
    }

    setMove(direction: number): void
    {
        this.direction = Math.sign(direction);
    }

    update(): void {

        this.corners.forEach(corner => {
            corner.y += this.direction * PADDLE_MOVE_STEP;
        });

        if (this.paddleOnEdge(this.direction))
        {
            let yTop: number = 0;
            let yBottom: number = 0;
            if (this.direction > 0)
            {
                yTop = 100 - PADDLE_HEIGHT - BALL_SEMIDIAMETER;
                yBottom = 100 + BALL_SEMIDIAMETER;
            }
            else if (this.direction < 0)
            {
                yTop = 0 - BALL_SEMIDIAMETER;
                yBottom = 0 + PADDLE_HEIGHT + BALL_SEMIDIAMETER;
            }

            this.corners[0].y = yTop;
            this.corners[1].y = yTop;
            this.corners[2].y = yBottom;
            this.corners[3].y = yBottom;
        }
    }

	reset(): void {
        this.corners[0].y = PADDLE_INIT_Y_TOP;
        this.corners[1].y = PADDLE_INIT_Y_TOP;
        this.corners[2].y = PADDLE_INIT_Y_BOTTOM;
        this.corners[3].y = PADDLE_INIT_Y_BOTTOM;
	}

    updatePrevPosition()
    {
        this.prevCorners = this.corners.map(point => ({ ...point }));
    }

    serialize(): PaddleState {
        return {
            yCenter: this.getCenterY(),
            height: PADDLE_HEIGHT,
            width: PADDLE_WIDTH
        };
    }
}