import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";
import {PlayerState} from "../models/player.js";

export enum GameStatus {
    Searching = 'searching',
    OpponentFound = 'opponent_found',
    GameProperties = 'game_properties',
    Pending = 'pending',
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}

export enum WsClientStatus {
    OpponentFound = 'opponent_found',
    MovePaddle = 'move_paddle',
    LeaveMatchmaking = 'leave_matchmaking',
    LeaveGame = 'leave_game',
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
    end_condition?: GameEndCondition;
    countdown?: number;
    winner_id?: number;
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
    end_condition?: GameEndCondition;
    winner_username?: string;
}

export interface WsDataSearch {}

export interface WsPendingMatchUser {
    user_id: number;
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
    is_bounce?: boolean;
    is_score?: boolean;
}

export interface WsDataEnded extends WsDataLive{
    end_condition: GameEndCondition;
    winner_id: number;
    winner_username: string;
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
    ScoreLimit = 'score_limit',
    Timeout = 'timeout',
    PlayerLeft = 'player_left',
    Unknown = 'unknown'
}

