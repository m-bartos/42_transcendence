export type MatchStatus = 'searching' | 'found';

export interface MatchmakingState {
    status: MatchStatus;
}