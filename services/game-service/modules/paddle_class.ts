import { PADDLE_INIT_POSITION, PADDLE_HEIGHT, PADDLE_MOVE_STEP, PADDLE_WIDTH, BALL_SEMIDIAMETER } from '../types/constants.js';

import { PaddleState, Point, PaddlePosition as PaddleType } from '../types/game.js'

export class Paddle {
    paddleType: PaddleType
    corners: Point[];
    prevCorners: Point[];

    // TODO: corners should be the right paddle corners. Would be nice if the BALL boundary can be added somehow so it will be more clear what is going on 
	constructor(paddleType: PaddleType) {
        this.paddleType = paddleType;

        const yTop = PADDLE_INIT_POSITION - PADDLE_HEIGHT / 2 - BALL_SEMIDIAMETER;
        const yBottom = PADDLE_INIT_POSITION + PADDLE_HEIGHT / 2 + BALL_SEMIDIAMETER;

        if (paddleType === 'left')
        {
            const corners = [{x: 0 - BALL_SEMIDIAMETER, y: yTop}, // top left
                            {x: 0 + PADDLE_WIDTH + BALL_SEMIDIAMETER, y: yTop}, // top right
                            {x: 0 + PADDLE_WIDTH + BALL_SEMIDIAMETER, y: yBottom}, // bottom right
                            {x: 0 - BALL_SEMIDIAMETER, y: yBottom}]; // bottom left
            this.corners = corners;
            this.prevCorners = corners;
        }
        else
        {
            const corners = [{x: 100 - PADDLE_WIDTH - BALL_SEMIDIAMETER, y: yTop},
                            {x: 100 + BALL_SEMIDIAMETER, y: yTop},
                            {x: 100 + BALL_SEMIDIAMETER, y: yBottom},
                            {x: 100 - PADDLE_WIDTH - BALL_SEMIDIAMETER, y: yBottom}];
            this.corners = corners;
            this.prevCorners = corners;
        }
        
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
        else
        {
            return (this.corners[3].y - BALL_SEMIDIAMETER >= 100);
        }
    }

    move(direction: number): void {
        this.prevCorners = this.corners;
        this.corners.forEach(corner => {
            corner.y += direction * PADDLE_MOVE_STEP;
        });
        if (this.paddleOnEdge(direction))
        {
            let yTop: number = -100;
            let yBottom: number = 100;
            if (direction > 0)
            {
                yTop = 100 - PADDLE_HEIGHT;
                yBottom = 100;
            }
            else if (direction < 0)
            {
                yTop = 0;
                yBottom = 0 + PADDLE_HEIGHT;

            }
            this.corners[0].y = yTop;
            this.corners[1].y = yTop;
            this.corners[2].y = yBottom;
            this.corners[3].y = yBottom;
        }

    }

	reset(): void {
        const yTop = PADDLE_INIT_POSITION - PADDLE_HEIGHT / 2;
        const yBottom = PADDLE_INIT_POSITION + PADDLE_HEIGHT / 2;

        this.corners[0].y = yTop;
        this.corners[1].y = yTop;
        this.corners[2].y = yBottom;
        this.corners[3].y = yBottom;
	}

    serialize(): PaddleState {
        return {
            y: this.getCenterY(),
            corners: this.corners
        };
    }
}