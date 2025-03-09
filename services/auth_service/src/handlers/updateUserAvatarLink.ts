import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

interface UploadBody {
    filePath?: string | undefined;
    sessionId?: string | undefined;
}

interface UserResponse {
    status: 'success' | 'error';
    message: string;
}

interface userId {
    user_id: number | undefined;
}


async function updateUserAvatarLink(this: FastifyInstance, request: FastifyRequest<{Body: UploadBody}>, reply: FastifyReply): Promise<UserResponse> {
    try
    {
        const {filePath, sessionId} = request.body;
        if (filePath)
        {
            const userId: userId | undefined = await this.dbSqlite('sessions').select('user_id').where({session_id: sessionId, revoked: false}).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").first();
            if (!userId)
            {
                reply.code(401);
                return {status: 'error', message: `unauthorized`};
            }
            await this.dbSqlite('users').update('avatar', filePath);
            reply.code(200);
            return {status: 'success', message: `user avatar link was updated successfully.`};
        }
        reply.code(400);
        return {status: 'error', message: `user avatar link was not not updated`};
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