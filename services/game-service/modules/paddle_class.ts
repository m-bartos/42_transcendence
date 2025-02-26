import { PADDLE_INIT_POSITION, PADDLE_HEIGHT, PADDLE_MOVE_STEP, PADDLE_WIDTH, BALL_SEMIDIAMETER, PADDLE_INIT_Y_TOP, PADDLE_INIT_Y_BOTTOM } from '../types/constants.js';

import { PaddleState, Point, PaddlePosition as PaddleType } from '../types/game.js'

export class Paddle {
    paddleType: PaddleType
    corners: Point[];
    prevCorners: Point[];

    // TODO: corners should be the right paddle corners. Would be nice if the BALL boundary can be added somehow so it will be more clear what is going on 
	constructor(paddleType: PaddleType) {
        
        const yTop = PADDLE_INIT_Y_TOP;
        const yBottom = PADDLE_INIT_Y_BOTTOM;
        
        this.paddleType = paddleType;

        if (paddleType === 'left')
        {
            const corners = [{x: 0 - BALL_SEMIDIAMETER, y: yTop}, // top left
                            {x: 0 + PADDLE_WIDTH + BALL_SEMIDIAMETER, y: yTop}, // top right
                            {x: 0 + PADDLE_WIDTH + BALL_SEMIDIAMETER, y: yBottom}, // bottom right
                            {x: 0 - BALL_SEMIDIAMETER, y: yBottom}]; // bottom left
            this.corners = corners;
        }
        else
        {
            const corners = [{x: 100 - PADDLE_WIDTH - BALL_SEMIDIAMETER, y: yTop},
                            {x: 100 + BALL_SEMIDIAMETER, y: yTop},
                            {x: 100 + BALL_SEMIDIAMETER, y: yBottom},
                            {x: 100 - PADDLE_WIDTH - BALL_SEMIDIAMETER, y: yBottom}];
            this.corners = corners;
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
        else
        {
            return (this.corners[3].y - BALL_SEMIDIAMETER >= 100);
        }
    }

    move(direction: number): void {
        this.corners.forEach(corner => {
            corner.y += direction * PADDLE_MOVE_STEP;
        });
        if (this.paddleOnEdge(direction))
        {
            let yTop: number = 0;
            let yBottom: number = 0;
            if (direction > 0)
            {
                yTop = 100 - PADDLE_HEIGHT - BALL_SEMIDIAMETER;
                yBottom = 100 + BALL_SEMIDIAMETER;
            }
            else if (direction < 0)
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
            y: this.getCenterY(),
            corners: this.corners
        };
    }
}