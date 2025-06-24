import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";
import {GamePlayerState} from "../models/player.js";
import {CanvasState} from "../../types/ws-server-messages.js";

export enum GameStatus {
    Pending = 'pending', // TODO: refactor and delete pending
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}


export interface GameState {
    status: GameStatus;
    canvas: CanvasState;
    paddles: PaddleState[];
    players: GamePlayerState[];
    ball: BallState;
    timestamp: number;
    created: Date;
    started?: Date;
    endCondition?: GameEndCondition;
    countdown?: number;
    winnerId?: number;
    ended?: Date;
    duration?: number;
}


export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout', // not used yet
    Error = 'error',
    Unknown = 'unknown'
}
