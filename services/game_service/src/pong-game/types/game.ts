import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";
import {PlayerState} from "../models/player.js";

export enum GameStatus {
    Pending = 'pending',
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}


export interface GameState {
    status: GameStatus;
    paddles: PaddleState[];
    players: PlayerState[];
    ball: BallState;
    timestamp: number;
    created: Date;
    started?: Date;
    endCondition?: GameEndCondition;
    countdown?: number;
    winnerId?: string;
    ended?: Date;
    duration?: number;
}

export interface WsGameState {
    // gameId: string;
    status: GameStatus;
    paddles: PaddleState[];
    players: PlayerState[];
    ball: BallState;
    timestamp: number;
    countdown?: number;
    // winnerId?: string;
    endCondition?: GameEndCondition;
    winnerUsername?: string;
}

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    PlayerLeft = 'playerLeft',
    Unknown = 'unknown'
}

export interface CreateGameBody {
    playerOneUserId: string;
    playerOneSessionId: string;
    playerTwoUserId: string;
    playerTwoSessionId: string;
}


