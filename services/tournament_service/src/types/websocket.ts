import {WebSocket} from "@fastify/websocket";

export interface WsQuery {
    playerJWT: string;
    gameId: string;
}

export interface SplitkeyboardWebSocket extends WebSocket {
    enteredQueue: number;
    connectionId: string;
    gameId: string | null;
    sessionId: string;
    userId: number;
    username: string;
    avatarLink: string;
    isAlive: boolean;
}