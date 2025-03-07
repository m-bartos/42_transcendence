import { WebSocket } from '@fastify/websocket';

export interface MatchWebSocket extends WebSocket {
	connectionId: string;
    sessionId: string | null;
}

export type MatchStatus = 'searching' | 'found';

export interface MatchmakingState {
    status: MatchStatus;
    gameId: string | null;
}

export interface CreateGameBody {
    playerOneId: string;
    playerTwoId: string;
}

export type GameCreateBody = {
    player1_id: string;
    player2_id: string;
};