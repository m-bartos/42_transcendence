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

export enum PlayerRole {
    Self= "self",
    Opponent = "opponent"
}

export interface PlayerState {
    username?: string;
    id?: number;
    score: number;
    paddleBounce: number;
    avatar?: string;
    ready?: boolean;
    role?: PlayerRole;
}

export enum MultiplayerGameEvent {
    Searching = 'searching',
    OpponentFound = 'opponentFound',
    GameProperties = 'gameProperties',
    Countdown = 'countdown',
    Live = 'live',
    Ended = 'ended',
}

export enum WsClientEvent {
    AcceptOpponent = 'acceptOpponent',
    MovePaddle = 'movePaddle',
    LeaveMatchmaking = 'leaveMatchmaking',
    LeaveGame = 'leaveGame',
}

export interface Canvas {
    width: number;
    height: number;
}

export interface WsDataSearch {}

export interface WsPendingMatchUser {
    userId: number;
    username: string;
    avatar: string;
    ready: boolean;
}

export interface WsDataOpponentFound {
    players: PlayerState[];
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
    event: MultiplayerGameEvent;
    timestamp: number;
    data: WsDataSearch | WsDataOpponentFound | WsDataCountdown | WsDataLive | WsDataEnded | WsGameDataProperties;
}

export interface WsClientLeaveMatchmaking {
    event: WsClientEvent.LeaveMatchmaking;
    timestamp: number;
    data: {};
}

export interface WsClientLeaveGame {
    event: WsClientEvent.LeaveGame;
    timestamp: number;
    data: {};
}

export interface WsClientAcceptOpponent {
    event: WsClientEvent.AcceptOpponent;
    timestamp: number;
    data: {
        "accept": boolean;
    };
}

export interface WsDataMovePaddle {
    direction: number;
}

export interface WsClientMovePaddle {
    event: WsClientEvent.MovePaddle;
    timestamp: number;
    data: WsDataMovePaddle;
}

export interface WsGameDataProperties {
    canvas: Canvas;
}

export enum GameEndCondition {
    ScoreLimit = 'scoreLimit',
    Timeout = 'timeout',
    PlayerLeft = 'playerLeft',
    Unknown = 'unknown'
}

