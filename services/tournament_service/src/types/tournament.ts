export enum TournamentStatus {
    Active = 'active',
    Finished = 'finished',
    Deleted = 'deleted',
}

export enum TournamentGameStatus {
    Pending = 'pending',
    Live = 'live',
    Finished = 'finished',
}

export interface TournamentGame {
    id: number;
    gameId: string;
    tournamentId?: number;
    status: TournamentGameStatus;
    endReason: string | null;
    playerOneUsername: string;
    playerOneScore: number;
    playerOnePaddleBounce: number;
    playerTwoUsername: string;
    playerTwoScore: number;
    playerTwoPaddleBounce: number;
    startedAt: string | null;
    endedAt: string | null;
    duration: number | null;
    winnerUsername: string | null;
    loserUsername: string | null;
}

export interface TournamentHeader {
    id: number;
    status: TournamentStatus;
    name: string;
    created: string;
    principalId: number;
}

export interface TournamentData extends TournamentHeader {
    games: TournamentGame[];
}