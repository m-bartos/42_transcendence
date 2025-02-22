import { WebSocket } from '@fastify/websocket';
export interface GameWebSocket extends WebSocket {
    gameId: string;
    playerId: string;
}

export type GameStatus = 'pending' | 'live' | 'waiting' | 'finished';

export type PaddlePosition = 'left' | 'right'

export interface GameState {
    status: GameStatus;
    paddle1: PaddleState;
    paddle2: PaddleState;
    ball: BallState;
    score1: number;
    score2: number;
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
    collision: boolean;
}
export interface CreateGameBody {
    player1_id: string;
    player2_id: string;
}

export interface Point {
    x: number;
    y: number;
}