import {PaddleState} from "../pong-game/types/paddle.js";
import {GamePlayerState} from "../pong-game/models/player.js";
import {BallState} from "../pong-game/types/ball.js";
import {GameEndCondition, GameStatus} from "../pong-game/types/game.js";

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

export interface WsDataSearch {
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
    event: GameStatus;
    timestamp: number;
    data: WsDataSearch | WsDataOpponentFound | WsDataCountdown | WsDataLive | WsDataEnded | WsGameDataProperties;
}

export interface WsGameDataProperties {
    canvas: CanvasState;
}