import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {getUserId, UserId} from "../utils/dbQueries.js";

interface UserBody {
    username: string;
    email: string;
    password: string;
}

interface ResponseBody {
    status: string,
    message: string,
}

async function updateUser(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply): Promise<ResponseBody> {
    const {username, password, email} = request.body;
    try
    {
        const userId: UserId | undefined = await getUserId(this, request);
        if (userId)
        {
            const updated: number = await this.dbSqlite('users').update({'username': username,'email': email, 'password': password})
            if (updated)
            {
                reply.code(200);
                return {status: 'success', message: 'user updated successfully.'};
            }
            reply.code(400);
            return {status: 'error', message: 'user update failed.'};
        }
        reply.code(400);
        return {status: 'error', message: 'user not found'};
    }
    catch (error) {
        if (error instanceof Error)
        {
            reply.code(500);
            return {status: 'error', message: error.message};
        }
        return {status: 'error', message: 'internal server error'};
    }
}

export default updateUser;