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
    countdown?: number;
    paddles: PaddleState[];
    players: PlayerState[];
    ball: BallState;
    timestamp: number;
}

export interface SplitkeybordGameState extends GameState {
    winnerUsername?: string;
}

export interface MultiplayerGameState extends GameState {
    winnerId?: string;
}

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    PlayerLeft = 'playerLeft',
    Unknown = 'unknown'
}

export enum GameType {
    Multiplayer = 'multiplayer',
    SplitKeyboard = 'splitKeyboard',
    Tournament = 'tournament',
}

export interface CreateGameBody {
    playerOneUserId: string;
    playerOneSessionId: string;
    playerTwoUserId: string;
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