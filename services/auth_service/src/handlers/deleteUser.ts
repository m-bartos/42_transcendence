import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

import {getUserId, UserId} from '../utils/dbQueries.js'
import {stat, rmdir, unlink} from "node:fs/promises";
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
            // update returns number of updated rows!!! positive number or 0
            const deactivateSessions: number = await this.dbSqlite('sessions').where({'user_id': userId.user_id, revoked: false}).update({revoked: true});
            // first returns single object or undefined
            const userDetails: UserDetails | null | undefined = await this.dbSqlite('users').select('username', 'email', 'avatar').where({'id': userId.user_id, active: true}).first();
            if (userDetails)
            {
                // deactivate user
                const deactivateUser: number = await this.dbSqlite('users').where({'id': userId.user_id, active: true}).update({active: false, username: userDetails.username + userId.user_id, email: userDetails.email + userId.user_id});
                // remove avatar from storage if the user has link
                if (userDetails.avatar)
                {
                    try
                    {
                        await stat(userDetails.avatar);
                        await unlink(userDetails.avatar);
                        await rmdir(dirname(userDetails.avatar)).catch(() => {});
                    }
                    catch(error: unknown)
                    {
                        if (error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT")
                        {
                            this.log.error(`${error.message}`);
                        }
                        else
                        {
                            throw error;
                        }
                    }
                }
                if (deactivateSessions && deactivateUser)
                {
                    reply.code(200);
                    return {status : 'success', message: `user deactivated`};
                }
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