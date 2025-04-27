import {WebSocket} from "@fastify/websocket";

export interface WsParams {
    gameId: string;
}

export interface WsQuery {
    playerJWT: string;
}

export interface GameWebSocket extends WebSocket {
    gameId: string;
    playerSessionId: string;
    userId: string;
    username: string;
}