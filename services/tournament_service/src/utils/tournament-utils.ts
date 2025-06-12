import {
    TournamentData,
    TournamentGame,
    TournamentGameStatus,
    TournamentHeader,
    TournamentStatus
} from "../types/tournament.js";
import {dbSqlite} from "../services/knex-db-connection.js";
import {NotFoundError} from "../models/not-found-error.js";

export async function getAllTournamentsHeadersByUserId(userId: number, status: TournamentStatus) {
    const tournamentHeader: TournamentHeader[] = await dbSqlite('tournaments').select(
        'id',
        'status',
        'name',
        'created')
        .where('status', status)
        .andWhere('principal_id', userId)

    if (!tournamentHeader) {
        throw new NotFoundError(`No active tournaments.`);
    }

    return tournamentHeader as TournamentHeader[];
}

export async function getTournamentById(userId: number, id: number, status: TournamentStatus[]) {

    // TODO: make it as one querry
    const tournamentHeader: TournamentHeader = await dbSqlite('tournaments').select(
        'id',
        'status',
        'name',
        'created')
        .whereIn('status', status)
        .andWhere('principal_id', userId)
        .andWhere('id', id)
        .first();

    if (!tournamentHeader) {
        throw new NotFoundError(`No active tournament with id = ${id}.`);
    }

    const tournamentGames: TournamentGame[] = await dbSqlite('tournament_games').select(
        'id',
        'game_id as gameId',
        'status',
        'end_reason as endReason',
        'player_one_username as playerOneUsername',
        'player_one_score as playerOneScore',
        'player_one_paddle_bounce as playerOnePaddleBounce',
        'player_two_username as playerTwoUsername',
        'player_two_score as playerTwoScore',
        'player_two_paddle_bounce as playerTwoPaddleBounce',
        'started_at as startedAt',
        'ended_at as endedAt',
        'duration as duration',
        'winner_username as winnerUsername',
        'loser_username as loserUsername')
        .andWhere('tournament_id', id);
    return {...tournamentHeader, games: tournamentGames} as TournamentData;
}

export async function deleteTournamentById(userId: number, tournamentId: number): Promise<number> {

    const updatedRowsCount = await dbSqlite('tournaments').update('status', TournamentStatus.Deleted, ['id'])
        .whereNot('status', TournamentStatus.Deleted)
        .andWhere('id', tournamentId)
        .andWhere('principal_id', userId);

    const count = updatedRowsCount.length;
    return (count);
}

export async function getUsernamesByGameId(userId: number, gameId: string): Promise<{
    playerOneUsername: string | null,
    playerTwoUsername: string | null
}> {

    const usernames: {
        player_one_username: string | null,
        player_two_username: string | null
    } = await dbSqlite.select('tournament_games.player_one_username', 'tournament_games.player_two_username')
        .from('tournaments')
        .leftJoin('tournament_games', 'tournaments.id', 'tournament_games.tournament_id')
        .where('tournaments.principal_id', userId)
        .andWhere('tournaments.status', TournamentStatus.Active)
        .andWhere('tournament_games.game_id', gameId)
        .andWhere('tournament_games.status', TournamentGameStatus.Pending)
        .first();

    if (!usernames) {
        return {playerOneUsername: null, playerTwoUsername: null};
    }

    return {playerOneUsername: usernames.player_one_username, playerTwoUsername: usernames.player_two_username};
}