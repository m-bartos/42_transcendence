export interface GetTournamentStatsDataPlayerRanking {
    username: string;
    wins: number;
    losses: number;
    winRate: number;
    linked: boolean;
    id: number;
}

export interface GetTournamentStatsData {
    id: number;
    status: string;
    name: string;
    created: string;
    totalGames: number;
    totalPlayers: number;
    gamesPlayed: number;
    gamesPending: number;
    playerRankings: GetTournamentStatsDataPlayerRanking[];
}

export interface GetTournamentStats {
    status: string;
    message: string;
    data: GetTournamentStatsData;
}