import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";
import {PlayerState} from "../models/player.js";

export enum GameStatus {
    Searching = 'searching',
    OpponentFound = 'opponentFound',
    GameProperties = 'gameProperties', // TODO: cannot be property of pong-game. It is a property of WsGameMessage
    Pending = 'pending', // TODO: refactor and delete pending
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}

export enum WsClientStatus {
    OpponentFound = 'opponentFound',
    MovePaddle = 'movePaddle',
    LeaveMatchmaking = 'leaveMatchmaking',
    LeaveGame = 'leaveGame',
}

export interface GameState {
    status: GameStatus;
    canvas: CanvasState;
    paddles: PaddleState[];
    players: PlayerState[];
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

export interface CanvasState {
    width: number;
    height: number;
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

export interface WsDataSearch {}

export interface WsPendingMatchUser {
    userId: number;
    username: string;
    avatar: string;
    ready: boolean;
}

export interface WsDataOpponentFound {
    self: WsPendingMatchUser;
    opponent: WsPendingMatchUser;
}

export interface WsDataCountdown extends WsDataLive {
    countdown: number;
}

export interface WsDataLive {
    paddles: PaddleState[];
    players: PlayerState[];
    ball: BallState;
    isBounce?: boolean;
    isScore?: boolean;
}

export interface WsDataEnded extends WsDataLive{
    endCondition: GameEndCondition;
    winnerId: number;
    winnerUsername: string;
    duration: number;
}

export interface WsGame {
    status: GameStatus;
    timestamp: number;
    data: WsDataSearch | WsDataOpponentFound | WsDataCountdown | WsDataLive | WsDataEnded | WsGameDataProperties;
}

export interface WsClientReady {
    status: WsClientStatus.OpponentFound;
    timestamp: number;
    data: WsDataOpponentFound;
}

export interface WsDataMovePaddle {
    direction: number;
}

export interface WsClientMessage {
    status: WsClientStatus;
    timestamp: number;
    data: WsDataMovePaddle | WsDataOpponentFound;
}

export interface WsGameDataProperties {
    canvas: CanvasState;
}

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    PlayerLeft = 'playerLeft',
    Unknown = 'unknown'
}

