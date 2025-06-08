export interface PaddleState {
    yCenter: number;
    xCenter: number;
    height: number;
    width: number;
}

export interface BallState {
    x: number;
    y: number;
    semidiameter: number;
}

export interface PlayerState {
    username?: string;
    id?: number;
    score: number;
    paddleBounce: number;
}

export enum SplitkeyboardGameEvent {
    GameProperties = 'gameProperties',
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}

export enum WsClientEvent {
    MovePaddle = 'movePaddle',
    LeaveGame = 'leaveGame',
}

export interface Canvas {
    width: number;
    height: number;
}

export interface WsDataSearch {}

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
    event: SplitkeyboardGameEvent;
    timestamp: number;
    data: WsDataCountdown | WsDataLive | WsDataEnded | WsGameDataProperties;
}

export interface WsDataMovePaddle {
    direction: number;
    username: string;
}

export interface WsClientMovePaddle {
    event: WsClientEvent.MovePaddle;
    timestamp: number;
    data: WsDataMovePaddle;
}

export interface WsGameDataProperties {
    canvas: Canvas;
    players?: PlayerState[];
}

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    Error = 'error',
    Unknown = 'unknown'
}

