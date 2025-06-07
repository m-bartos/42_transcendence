import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {TournamentData, TournamentGame, TournamentHeader, TournamentStatus} from "../types/tournament.js";
import {dbSqlite} from "../services/knex-db-connection.js";
import {NotFoundError} from "../modenot-found-error.tsnot-found-error.js";


interface GetActiveTournamentParams {
    id: number;
}

interface GetTournamentResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentData;
    conflict?: string;
}

interface Sqlite3Error extends Error {
    code?: string
}

export async function getTournamentById(userId: number, id: number) {

    // TODO: make it as one querry
    const tournamentHeader: TournamentHeader = await dbSqlite('tournaments').select(
        'id',
        'status',
        'name',
        'created')
        .where('status', TournamentStatus.Active)
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
        'duration_seconds as duration',
        'winner_username as winnerUsername',
        'loser_username as loserUsername')
        .andWhere('tournament_id', id);
    return {...tournamentHeader, games: tournamentGames} as TournamentData;
}

async function getActiveTournament(this: FastifyInstance, request: FastifyRequest<{Params: GetActiveTournamentParams}>, reply: FastifyReply): Promise<GetTournamentResponse> {
    try {
        const userId = request.userId;
        const tournamentId = request.params.id;

        if (!userId) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }

        const data = await getTournamentById(userId, tournamentId)

        reply.code(200);
        return {status: 'success', message: `Info for tournament id = ${tournamentId}.`, data};
    } catch (error: unknown) {
        // TODO: assign correct error messages
        if (error instanceof NotFoundError)
        {
            if (error.name === 'NotFoundError') {
                reply.code(400);
                return {status: 'error', message: error.message};
            }
        }
        else if (error instanceof Error) {
            const sqliteError = error as Sqlite3Error; // Narrow to sqlite3 shape
            if (sqliteError.code === 'SQLITE_CONSTRAINT')
            {
                reply.code(400);
                return {status: 'error', message: sqliteError.message};
            } else {
                reply.code(500);
                return {status: 'error', message: sqliteError.message};
            }
        }
        reply.code(500);
        return {status: 'error', message: 'internal server error'};
    }
}

export default getActiveTournament;