import { PADDLE_INIT_POSITION, PADDLE_HEIGHT, PADDLE_MOVE_STEP, PADDLE_WIDTH, BALL_SEMIDIAMETER } from '../types/constants.js';

import { PaddleState, Point, PaddlePosition as PaddleType } from '../types/game.js'

export class Paddle {
    paddleType: PaddleType
    corners: Point[];
    prevCorners: Point[];

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

    paddleOnEdge(direction: number)
    {
        if (direction < 0)
        {
            return (this.corners[0].y + BALL_SEMIDIAMETER + direction * PADDLE_MOVE_STEP <= 0);
        }
        else
        {
            return (this.corners[3].y - BALL_SEMIDIAMETER + direction * PADDLE_MOVE_STEP >= 100);
        }
    }
    // TODO: move PADDLE just on the edge even when paddleOnEdge is true
    move(direction: number): void {
        if (this.paddleOnEdge(direction))
        {
            return;
        }

        this.prevCorners = this.corners;
        this.corners.forEach(corner => {
            corner.y += direction * PADDLE_MOVE_STEP;
        });


        // const newPosition = this.y + direction * PADDLE_MOVE_STEP;
        // // Ensure paddle stays within bounds
        // const minY = PADDLE_HEIGHT / 2;
        // const maxY = 100 - PADDLE_HEIGHT / 2;
        // this.y = Math.max(minY, Math.min(maxY, newPosition));
    }

	reset(): void {
        const yTop = PADDLE_INIT_POSITION - PADDLE_HEIGHT / 2;
        const yBottom = PADDLE_INIT_POSITION + PADDLE_HEIGHT / 2;

        this.corners[0].y = yBottom;  // Bottom-left corner
        this.corners[1].y = yBottom;  // Bottom-right corner
        this.corners[2].y = yTop;     // Top-right corner
        this.corners[3].y = yTop;     // Top-left corner
	}

    serialize(): PaddleState {
        return {
            y: ((this.corners[2].y + this.corners[1].y) / 2),
            corners: this.corners
        };
    }
}