import {WebSocket} from "@fastify/websocket";

export interface WsQuery {
    playerJWT: string;
}

export interface MatchWebSocket extends WebSocket {
    connectionId: string;
    sessionId: string | null;
}