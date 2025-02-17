import { WebSocket } from '@fastify/websocket';
export interface GameWebSocket extends WebSocket {
    gameId: string;
    playerId: string;
}

export type GameStatus = 'pending' | 'live' | 'finished';

export interface GameState {
    status: GameStatus;
    paddle1: PaddleState;
    paddle2: PaddleState;
    ball: BallState;
}

export interface PaddleState {
    y_cor: number;
}

export interface BallState {
    x: number;
    y: number;
    dx: number;
    dy: number;
    size: number;
}
export interface CreateGameBody {
    player1_id: string;
    player2_id: string;
}