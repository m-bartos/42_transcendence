import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";

export type GameStatus = 'pending' | 'countdown' | 'live' | 'finished';

export interface GameState {
    status: GameStatus;
    countdown?: number;
    paddleOne: PaddleState;
    paddleTwo: PaddleState;
    ball: BallState;
    playerOneScore: number;
    playerTwoScore: number;
    playerOneUsername: string;
    playerTwoUsername: string;
    timestamp: number;
}

export interface CreateGameBody {
    playerOneSessionId: string;
    playerTwoSessionId: string;
}

