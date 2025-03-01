import { WebSocket } from '@fastify/websocket';

export interface MatchWebSocket extends WebSocket {
	connectionId: string;
    jwt: string | null;
}

export type MatchStatus = 'pending' | 'created';

export interface MatchmakingState {
    // status: MatchStatus;
    gameId: string;
}

export interface CreateGameBody {
    playerOneId: string;
    playerTwoId: string;
}

export type GameCreateBody = {
    player1_id: string;
    player2_id: string;
};