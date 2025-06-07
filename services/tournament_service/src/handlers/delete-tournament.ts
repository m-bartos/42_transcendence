import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {TournamentData, TournamentStatus} from "../types/tournament.js";
import {dbSqlite} from "../services/knex-db-connection.js";

import {NotFoundError} from "../models/not-found-error.js";
import {getActiveTournamentById} from "./get-active-tournament.js";


interface GetActiveTournamentParams {
    id: number;
}

interface DeleteTournamentResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentData;
    conflict?: string;
}

interface Sqlite3Error extends Error {
    code?: string
}

export async function deleteTournamentById(userId: number, tournamentId: number): Promise<number> {

    // it is correct. Just IDE has a problem with the number
    const updatedRowsCount: number = await dbSqlite('tournaments').update('status', TournamentStatus.Deleted)
        .whereNot('status', TournamentStatus.Deleted)
        .andWhere('id', tournamentId)
        .andWhere('principal_id', userId);
    return (updatedRowsCount);
}

async function deleteTournament(this: FastifyInstance, request: FastifyRequest<{Params: GetActiveTournamentParams}>, reply: FastifyReply): Promise<DeleteTournamentResponse> {
    try {
        const userId = request.userId;
        const tournamentId = request.params.id;

        if (!userId) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }

        const deletedRows = await deleteTournamentById(userId, tournamentId);
        if (deletedRows === 0)
        {
            reply.code(400);
            return {status: 'error', message: 'Tournament not found.'};
        }

        reply.code(200);
        return {status: 'success', message: `Tournament with id = ${tournamentId} deleted.`};
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

export default deleteTournament;