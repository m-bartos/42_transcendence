import {PaddleState} from "./paddle.js";
import {BallState} from "./ball.js";
import {PlayerState} from "../models/player.js";

export enum GameStatus {
    Searching = 'searching',
    OpponentFound = 'opponent_found',
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
    data: WsDataSearch | WsDataOpponentFound | WsDataCountdown | WsDataLive | WsDataEnded;
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

export enum GameEndCondition {
    ScoreLimit = 'score_limit',
    Timeout = 'timeout',
    PlayerLeft = 'player_left',
    Unknown = 'unknown'
}

export interface CreateGameBody {
    playerOneUserId: string;
    playerOneSessionId: string;
    playerTwoUserId: string;
    playerTwoSessionId: string;
}


