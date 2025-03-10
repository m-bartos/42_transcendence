import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {getUserId, UserId } from '../utils/dbQueries.js'

interface responseBody {
    status: string;
    message: string;
    data?: any;
}

interface UserInfo {
    user_id: number;
    username: string;
    email: string;
}

async function getUserInfo(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<responseBody> {
    try
    {
        const userId: UserId | undefined = await getUserId(this, request);
        if (!userId)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized.'};
        }
        const userInfo: UserInfo = await this.dbSqlite('users').where({id: userId.user_id, active: true}).first();
        if (!userInfo)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized.'};
        }
        reply.code(200);
        return {status: 'success', message: 'user info', data: userInfo};
    }
    catch(error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
            return {status: 'error', message: error.message};
        else
            return {status: 'error', message: 'internal server error'};
    }
}

export default getUserInfo;