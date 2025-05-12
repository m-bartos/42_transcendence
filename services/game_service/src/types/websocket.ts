import {WebSocket} from "@fastify/websocket";

export interface WsQuery {
    playerJWT: string;
}

export interface GameWebSocket extends WebSocket {
    enteredQueue: number;
    connectionId: string;
    gameId: string | null;
    sessionId: string;
    userId: number;
    username: string;
}