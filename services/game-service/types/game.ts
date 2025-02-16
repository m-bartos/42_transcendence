import {WebSocket} from '@fastify/websocket'
import { preValidationHookHandler } from 'fastify';

type GameStatus = 'pending' | 'live' | 'finished';

interface Paddle {
    y_cor: number
}

interface Ball {
    x_cor: number,
    y_cor: number,
    size: number
}

interface GameState {
    status: GameStatus,
    paddle1: Paddle,
    paddle2: Paddle,
    ball: Ball
}

export interface Game {
    id: string;
    state: GameState,
    player1: {
        id: string,
        websocket?: WebSocket | null
     };
    player2: {
        id: string,
        websocket: WebSocket | null
     };
    created_at: Date;
}

export interface CreateGameBody {
    player1_id: string;
    player2_id: string;
}