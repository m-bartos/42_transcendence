import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {mkdir, rmdir, unlink} from 'node:fs/promises';
import { dirname } from 'node:path';


interface UploadBody {
    filePath?: string | undefined;
    sessionId?: string | undefined;
}

interface UserResponse {
    status: 'success' | 'error';
    message: string;
    data?: Avatar
}

interface UserId {
    user_id: number | undefined;
}

 interface Avatar {
    avatar: string;
 }


async function updateUserAvatarLink(this: FastifyInstance, request: FastifyRequest<{Body: UploadBody}>, reply: FastifyReply): Promise<UserResponse> {
    try
    {
        const {filePath, sessionId} = request.body;
        if (filePath && sessionId)
        {
            const userId: UserId | undefined = await this.dbSqlite('sessions').select('user_id').where({session_id: sessionId, revoked: false}).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").first();
            if (!userId)
            {
                reply.code(401);
                return {status: 'error', message: `unauthorized`};
            }
            const avatar: Avatar | undefined = await this.dbSqlite('users').select('avatar').where({id: userId.user_id, active: true}).first();
            if (avatar === undefined)
            {
                reply.code(401);
                return {status: 'error', message: `unauthorized`};
            }
            if (avatar.avatar === '')
            {
                await this.dbSqlite('users').where({id: userId.user_id}).update('avatar', filePath);
                reply.code(200);
                return {status: 'success', message: `user avatar link was updated successfully`};
            }
            else
            {
                try
                {
                    await unlink(avatar.avatar);
                    await rmdir(dirname(avatar.avatar)).catch(() => {});
                }
                catch(deleteError)
                {
                    console.warn(deleteError);
                }
                await this.dbSqlite('users').where({id: userId.user_id}).update('avatar', filePath);
                reply.code(200);
                return {status: 'success', message: `user avatar link was updated successfully`};
            }
        }
        reply.code(400);
        return {status: 'error', message: `missing or invalid request payload.`};
    }
    catch(error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
        {
            return {status: 'error', message: `error message: ${error.message}`};
        }
        return {status: 'error', message: `internal server error`};
    }
}

export default updateUserAvatarLink;