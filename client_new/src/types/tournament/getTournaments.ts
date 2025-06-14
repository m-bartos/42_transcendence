export interface GetTournamentsTournament {
    id: number;
    name: string;
    created: string;
}

export interface GetTournaments {
    status: string;
    message: string;
    data: GetTournamentsTournament[];
}