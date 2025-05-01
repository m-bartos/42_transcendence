import {WebSocket} from "@fastify/websocket";

// export interface WsParams {
//     gameId: string;
// }

export interface WsQuery {
    playerJWT: string;
}

export interface GameWebSocket extends WebSocket {
    connectionId: string;
    gameId: string | null;
    sessionId: string;
    userId: string;
    username: string;
}