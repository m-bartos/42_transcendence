import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {TournamentData, TournamentStatus} from "../types/tournament.js";

import {NotFoundError} from "../models/not-found-error.js";
import {getTournamentById} from "../utils/tournament-utils.js";
import {Sqlite3Error} from "../types/sqlite.js";


interface GetActiveTournamentParams {
    id: number;
}

interface GetTournamentResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentData;
    conflict?: string;
}

async function getActiveTournament(this: FastifyInstance, request: FastifyRequest<{Params: GetActiveTournamentParams}>, reply: FastifyReply): Promise<GetTournamentResponse> {
    try {
        const userId = request.userId;
        const tournamentId = request.params.id;
        if (!userId) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }

        const data = await getTournamentById(tournamentId, [TournamentStatus.Active, TournamentStatus.Finished])

        if (data && data.principalId !== userId)
        {
            reply.code(400);
            return {status: 'error', message: 'Tournament not found'};
        }

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