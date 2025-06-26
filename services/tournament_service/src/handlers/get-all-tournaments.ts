import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {TournamentHeader, TournamentStatus} from "../types/tournament.js";
import {getAllTournamentsHeadersByUserId} from "../utils/tournament-utils.js";
import {Sqlite3Error} from "../types/sqlite.js";

interface GetTournamentsResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentHeader[];
    conflict?: string;
}

interface GetTournamentsQuery {
    status: TournamentStatus;
}

async function getAllTournaments(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<GetTournamentsResponse> {
    try {
        const userId = request.userId;
        const { status } = request.query as GetTournamentsQuery;
        if (!userId || !status) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }
        const tournaments = await getAllTournamentsHeadersByUserId(userId, status);

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

export default getAllTournaments;