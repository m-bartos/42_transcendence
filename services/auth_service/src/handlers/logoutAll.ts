import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {getUserId, UserId} from "../utils/dbQueries.js";

interface ResponseBody
{
    status: string
    message: string
}

async function logoutAll(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<ResponseBody> {
    try {
        const userId: UserId | undefined = await getUserId(this, request);
        if (!userId)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        const sessions: number = await this.dbSqlite('sessions').where('user_id', userId.user_id).update('revoked', true);
        if (!sessions)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        reply.code(200);
        return {status: 'success', message: 'all sessions revoked'};
    }
    catch (error: unknown) {
        reply.code(500);
        if (error instanceof Error)
            return {status: 'error', message: error.message};
        return {status: 'error', message: 'internal server error'};
    }
}

export default logoutAll;