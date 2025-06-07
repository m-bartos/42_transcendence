import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {TournamentData, TournamentGame, TournamentHeader, TournamentStatus} from "../types/tournament.js";
import {dbSqlite} from "../services/knex-db-connection.js";
import {NotFoundError} from "../modenot-found-error.tsnot-found-error.js";

interface GetTournamentsResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentHeader[];
    conflict?: string;
}

interface Sqlite3Error extends Error {
    code?: string
}

async function getAllActiveTournamentsHeadersByUserId(userId: number) {
    const tournamentHeader: TournamentHeader[] = await dbSqlite('tournaments').select(
        'id',
        'status',
        'name',
        'created')
        .where('status', TournamentStatus.Active)
        .andWhere('principal_id', userId)

    if (!tournamentHeader) {
        throw new NotFoundError(`No active tournaments.`);
    }

    return tournamentHeader as TournamentHeader[];
}


async function getAllActiveTournaments(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<GetTournamentsResponse> {
    try {
        const userId = request.userId;

        if (!userId) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }
        const tournaments = await getAllActiveTournamentsHeadersByUserId(userId);

        reply.code(200);
        return {status: 'success', message: `Active tournaments`, data: tournaments};
    } catch (error: unknown) {
        // TODO: assign correct error messages
        if (error instanceof Error) {
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

export default getAllActiveTournaments;