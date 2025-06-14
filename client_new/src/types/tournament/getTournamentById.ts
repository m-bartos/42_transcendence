export interface GetTournamentByIdResponse {
    status: string;
    message: string;
    data: GetTournamentByIdData;
}

export interface GetTournamentByIdData {
    id: number;
    name: string;
    status: string;
    created: string;
    games: GetTournamentByIdDataGame[];
}

export interface GetTournamentByIdDataGame {
    id: number;
    gameId: string;
    status: string;
    playerOneUsername: string;
    playerTwoUsername: string;
    playerOneScore: number;
    playerTwoScore: number;
    playerOnePaddleBounce: number;
    playerTwoPaddleBounce: number;
    winnerUsername: string;
    loserUsername: string;
    duration: number;
    endReason: string;
}