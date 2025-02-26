import { WebSocket } from '@fastify/websocket';
export interface GameWebSocket extends WebSocket {
    gameId: string;
    playerId: string;
}

export  enum PaddleSide {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom'
}
export interface CollisionPoint extends Point{
    paddleSide: PaddleSide | null
}

export type GameStatus = 'pending' | 'live' | 'waiting' | 'finished';

export enum PaddlePosition {
    Left = 'left', 
    Right = 'right'
}

export interface GameState {
    status: GameStatus;
    paddle1: PaddleState;
    paddle2: PaddleState;
    ball: BallState;
    score1: number;
    score2: number;
    timestamp: number;
}

export interface PaddleState {
    y: number;
    corners: Point[];
}

export interface BallState {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    dx: number;
    dy: number;
    size: number;
}
export interface CreateGameBody {
    player1_id: string;
    player2_id: string;
}

export interface Point {
    x: number;
    y: number;
}