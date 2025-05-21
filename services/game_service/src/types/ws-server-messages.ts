import {PaddleState} from "../pong-game/types/paddle.js";
import {GamePlayerState} from "../pong-game/models/player.js";
import {BallState} from "../pong-game/types/ball.js";
import {GameEndCondition} from "../pong-game/types/game.js";

export enum WsEvent {
    Searching = 'searching',
    OpponentFound = 'opponentFound',
    GameProperties = 'gameProperties',
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}

export interface CanvasState {
    width: number;
    height: number;
}

export interface MatchPlayerState {
    id: number;
    username: string;
    avatar: string;
    ready: boolean;
    role: string;
}

export interface WsDataSearching {
}

export interface WsDataOpponentFound {
    players: MatchPlayerState[];
}

export interface WsDataCountdown extends WsDataLive {
    countdown: number;
}

export interface WsDataLive {
    paddles: PaddleState[];
    players: GamePlayerState[];
    ball: BallState;
    isBounce?: boolean;
    isScore?: boolean;
}

export interface WsDataEnded extends WsDataLive {
    endCondition: GameEndCondition;
    winnerId: number;
    winnerUsername: string;
    duration: number;
}

export interface WsGame {
    event: WsEvent;
    timestamp: number;
    data: WsDataSearching | WsDataOpponentFound | WsGameDataProperties | WsDataCountdown | WsDataLive | WsDataEnded;
}

export interface WsGameDataProperties {
    canvas: CanvasState;
}