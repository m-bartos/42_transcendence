import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

import {getUserId, UserId} from '../utils/dbQueries.js'
import {rmdir, unlink} from "node:fs/promises";
import {dirname} from "node:path";

interface ResponseBody {
    status: string,
    message: string,
    data?:[]
}

interface UserDetails {
    username: string,
    email: string,
    avatar: string,
}

async function deleteUser(this:FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<ResponseBody> {
    try
    {
        const userId: UserId | undefined = await getUserId(this, request);
        if (userId)
        {
            const deactivateSessions: number = await this.dbSqlite('sessions').where('user_id', userId.user_id).update({revoked: true});
            const userDetails: UserDetails = await this.dbSqlite('users').select('username', 'email', 'avatar').where('id', userId.user_id).first();
            const deactivateUser: number = await this.dbSqlite('users').where('id', userId.user_id).update({active: false, username: userDetails.username + userId.user_id, email: userDetails.email + userId.user_id});
            // remove avatar from the storage
            if (userDetails.avatar)
            {
                await unlink(userDetails.avatar);
                await rmdir(dirname(userDetails.avatar)).catch(() => {});
            }
            if (deactivateSessions && deactivateUser)
            {
                reply.code(200);
                return {status : 'success', message: `user deactivated`};
            }
        }
        reply.code(401);
        return {status : 'error', message: `unauthorized`};
    }
    catch (error: unknown) {
        reply.code(500);
        if (error instanceof Error)
        {
            return {status: 'error', message: error.message};
        }
        return {status: 'error', message: 'internal server error'};
    }
}

export default deleteUser;