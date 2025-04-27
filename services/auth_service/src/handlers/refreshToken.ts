import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify'
import {getUserId, UserId} from '../utils/dbQueries.js'
import { encryptUserId } from "../utils/secureUserId.js";

interface ResponseBody {
    status: string,
    message: string,
    data?: object
}


async function refreshToken(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<ResponseBody> {
    try {
        const userId: UserId | undefined = await getUserId(this, request);
        if (!userId)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        const user: object | undefined = await this.dbSqlite('users').where({'id': userId.user_id, 'active': true}).first();
        if (!user)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        const token: string = this.jwt.sign({ jti: request.session_id, sub: encryptUserId(userId.user_id.toString())});
        reply.code(200);
        return {status: 'success', message: 'new token', data: {token}};
    }
    catch (error: unknown) {
        if (error instanceof Error)
        {
            reply.code(500);
            return {status: 'error', message: error.message};
        }
        return {status: 'error', message: 'internal server error'};
    }
}

export default refreshToken;