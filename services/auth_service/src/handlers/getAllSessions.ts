import type {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';

import {SQLiteError} from "../types/sqlite.js";

interface Session {
    session_id: string;
    user_id: number;
    ip_address: string;
    user_agent: string;
    created_at: string;
    expires_at: string;
    revoked: boolean;
}

interface userId {
    user_id: number
}

interface responseBody {
    status: string;
    count?: number;
    message: string;
    data?: object[];
}
async function getAllSessions(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<responseBody> {
    try
    {
        const userId: userId = await this.dbSqlite('sessions').select('user_id').where({session_id: request.session_id, revoked: false}).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").first();
        if (!userId)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        const sessions: Session[] = await this.dbSqlite.select('*').from('sessions').where({user_id : userId.user_id, revoked: false}).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')");
        if (!sessions.length)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        const response: responseBody = {
            status: 'success',
            count: sessions.length,
            message: `sessions retrieved`,
            data: sessions,
        }
        reply.code(200);
        return response;
    } catch (error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
        {
            const sqliteError = error as SQLiteError;
            return {status: 'error', message: sqliteError.message};
        }
        return {status: "error", message: "internal server error"};
    }
}

export default getAllSessions