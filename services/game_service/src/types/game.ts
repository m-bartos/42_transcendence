import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";

export type GameStatus = 'pending' | 'countdown' | 'live' | 'finished';

export interface GameState {
    status: GameStatus;
    countdown?: number;
    playerOne: {
        username: string;
        paddle: PaddleState;
        score: number;
    };
    playerTwo: {
        username: string;
        paddle: PaddleState;
        score: number;
    };
    ball: BallState;
    timestamp: number;
}

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    PlayerLeft = 'playerLeft'
}

export enum GameType {
    Normal = 'normal',
    SplitKeyboard = 'splitKeyboard'
}

export interface CreateGameBody {
    playerOneSessionId: string;
    playerTwoSessionId: string;
}


export interface CreateGameResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        gameId: string;
        created: string;
    }
}