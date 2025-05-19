import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";
import {GamePlayerState} from "../models/player.js";
import {CanvasState} from "../../types/ws-server-messages.js";

export enum GameStatus {
    Searching = 'searching',
    OpponentFound = 'opponentFound',
    GameProperties = 'gameProperties', // TODO: cannot be property of pong-game. It is a property of WsGameMessage
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

//
// export interface WsGameState {
//     // gameId: string;
//     status: GameStatus;
//     paddles: PaddleState[];
//     players: PlayerState[];
//     ball: BallState;
//     timestamp: number;
//     countdown?: number;
//     // winnerId?: string;
//     endCondition?: GameEndCondition;
//     winnerUsername?: string;
// }

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    PlayerLeft = 'playerLeft',
    Unknown = 'unknown'
}

