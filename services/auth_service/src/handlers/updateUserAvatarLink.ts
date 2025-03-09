import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

interface UploadBody {
    filePath?: string | undefined;
}

interface UserResponse {
    status: 'success' | 'error';
    message: string;
}



async function updateUserAvatarLink(this: FastifyInstance, request: FastifyRequest<{Body: UploadBody}>, reply: FastifyReply): Promise<UserResponse> {
    try
    {
        const {filePath} = request.body;
        if (filePath)
        {
            await this.dbSqlite('users').update('avatar', filePath);
            reply.code(200);
            return {status: 'success', message: `user avatar link was updated successfully.`};
        }
        reply.code(404);
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