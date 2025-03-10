import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import type {SQLiteError} from '../types/sqlite.js'

interface Session {
    session_id: string;
    user_id: number;
    ip_address: string;
    user_agent: string;
    created_at: string;
    expires_at: string;
    revoked: boolean;
}

interface ResponseBody {
    status: string;
    message: string;
}

async function logoutUser(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply):Promise<ResponseBody> {
    try
    {
        const session: number = await this.dbSqlite<Session>('sessions').where({session_id: request.session_id, revoked: false}).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").update({revoked: true});
        if (!session)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        reply.code(200);
        return {status: 'success', message: 'successfully logged out.'};
    }
    catch(error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
        {
            const sqliteError: SQLiteError = error;
            return {status: 'error', message: sqliteError.message};
        }
        return {status: 'error', message: 'internal server error'};
    }
}

export default logoutUser;