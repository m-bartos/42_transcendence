import { PADDLE_INIT_POSITION, PADDLE_HEIGHT, PADDLE_MOVE_STEP } from '../types/constants.js';

import { PaddleState } from '../types/game.js'

export class Paddle {
	y_cor: number;
    
	constructor() {
        this.y_cor = PADDLE_INIT_POSITION;
    }

    move(direction: number): void {
        const newPosition = this.y_cor + direction * PADDLE_MOVE_STEP;
        // Ensure paddle stays within bounds
        const minY = PADDLE_HEIGHT / 2;
        const maxY = 100 - PADDLE_HEIGHT / 2;
        this.y_cor = Math.max(minY, Math.min(maxY, newPosition));
    }

	reset(): void {
		this.y_cor = PADDLE_INIT_POSITION;
	}

    serialize(): PaddleState {
        return {
            y_cor: this.y_cor
        };
    }
}