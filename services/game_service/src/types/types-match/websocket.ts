import {WebSocket} from "@fastify/websocket";

export interface WsQuery {
    playerJWT: string;
}

export interface MatchWebSocket extends WebSocket {
    connectionId: string;
    userId: string | null;
    sessionId: string | null;
}