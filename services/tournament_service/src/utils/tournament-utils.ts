import {
    TournamentData,
    TournamentGame,
    TournamentGameStatus,
    TournamentHeader,
    TournamentStatus
} from "../types/tournament.js";
import {dbSqlite} from "../services/knex-db-connection.js";
import {NotFoundError} from "../models/not-found-error.js";
import {GameState} from "../pong-game/types/game.js";
import {getStatsOfTournamentById} from "../handlers/get-stats-of-tournament.js";

export async function getAllTournamentsHeadersByUserId(userId: number, status: TournamentStatus) {
    const tournamentHeader: TournamentHeader[] = await dbSqlite('tournaments').select(
        'id',
        'status',
        'name',
        'created')
        .where('status', status)
        .andWhere('principal_id', userId)
        .orderBy('created', 'desc')

    if (!tournamentHeader) {
        throw new NotFoundError(`No active tournaments.`);
    }

    return tournamentHeader as TournamentHeader[];
}

export async function getTournamentById(id: number, status?: TournamentStatus[]) {
    if (!status) {
        status = [TournamentStatus.Finished, TournamentStatus.Active, TournamentStatus.Deleted];
    }

    // TODO: make it as one querry
    const tournamentHeader: TournamentHeader = await dbSqlite('tournaments').select(
        'id',
        'status',
        'name',
        'principal_id as principalId',
        'created')
        .whereIn('status', status)
        .andWhere('id', id)
        .first();

    if (!tournamentHeader) {
        throw new NotFoundError(`No ${status} tournament with id = ${id}.`);
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

export async function getTournamentByGameId(gameId: string) {
    const { tournamentId } = await dbSqlite('tournament_games').select('tournament_id as tournamentId').where('game_id', gameId).first();

    if (tournamentId) {
        return getTournamentById(tournamentId);
    }
}

// TODO: update proper types
// TODO: eventhandler?
export async function updateDbAfterGameFinish(gameState: any)  {
    const data = gameState.data;

    let winnerUsername = '';
    let loserUsername = '';


    if (data.winnerId === data.playerOne.id)
    {
        winnerUsername = data.playerOne.username;
        loserUsername = data.playerTwo.username;
    }
    else if (data.winnerId === data.playerTwo.id)
    {
        winnerUsername = data.playerTwo.username;
        loserUsername = data.playerOne.username;
    }

    await dbSqlite('tournament_games').where('game_id', gameState.gameId).update({
        end_reason: data.endCondition,
        player_one_score: data.playerOne.score,
        player_one_paddle_bounce: data.playerOne.paddleBounce,
        player_two_score: data.playerTwo.score,
        player_two_paddle_bounce: data.playerTwo.paddleBounce,
        started_at: data.started,
        ended_at: data.ended,
        duration: data.duration,
        winner_username: winnerUsername,
        loser_username: loserUsername,
        status: TournamentGameStatus.Finished
    })


    const tournament = await getTournamentByGameId(gameState.gameId);

    if (tournament)
    {
        const allGamesFinished = tournament.games.every(game => game.status === TournamentGameStatus.Finished)

        if (allGamesFinished) {
            await dbSqlite('tournaments').where('id', tournament.id).update('status', TournamentStatus.Finished);
        }


        // TODO: send result of tournament to dashboard service
        // await sendTournamentFinalStats(tournament.id);
    }
}


// async function sendTournamentFinalStats(tournamentId: number) {
//     const tournamentStats = await getStatsOfTournamentById(tournamentId);
//
//     try {
//         const message = {
//             event: 'tournament.end',
//             tournamentId: tournamentStats.id,
//             timestamp: Date.now(),
//             data: {
//                 gameType: 'tournament',
//                 tournamentId: tournamentStats.id,
//                 principalId: tournamentStats.principalId,
//                 playerOne: tournamentStats.players[0],
//                 playerTwo: tournamentStats.players[1],
//                 created: tournamentStats.created,
//                 endCondition: tournamentStats.endCondition,
//                 ended: game.ended,
//                 duration: game.duration,
//             }
//         };
//         return message;
//     } catch (error) {
//         console.error('Failed to construct game ended message: ', error);
//         throw error;
//     }
//
// }