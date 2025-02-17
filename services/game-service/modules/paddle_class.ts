import { PADDLE_INIT_POSITION, PADDLE_MOVE_STEP } from '../types/constants.js';

import { PaddleState } from '../types/game.js'

export class Paddle {
	y_cor: number;
    
	constructor() {
        this.y_cor = PADDLE_INIT_POSITION;
    }

    move(direction: number): void {
        this.y_cor = this.y_cor + direction * PADDLE_MOVE_STEP;
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