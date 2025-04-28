export type MatchStatus = 'searching' | 'found';

export interface MatchmakingState {
    status: MatchStatus;
    gameId: string | null;
}

export type GameCreateBody = {
    player1_id: string;
    player2_id: string;
};