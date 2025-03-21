import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import multipart, { MultipartFile } from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import {createWriteStream} from 'node:fs';
import { randomUUID } from 'node:crypto';
import {mkdir, rmdir, unlink} from 'node:fs/promises';
import { dirname } from 'node:path';

async function updateUserProfile(request: FastifyRequest, filePath: string) {
    const response: Response = await fetch('http://auth_service:3000/user/internal/avatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: filePath, sessionId: request.session_id }),
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const body = await response.json() as { data?: { avatar: string } };
    return body.data?.avatar; // Return old avatar path if it exists
}

async function uploadHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const file: MultipartFile | undefined = await request.file();
    if (!file) {
        request.log.info('No file provided, sending 400 response');
        reply.code(400);
        return { status: 'error', message: 'invalid payload/file' };
    }

    const uniqueDir = randomUUID();
    const filePath = `/static_data/${uniqueDir}/${file.filename}`;

    try {
        const oldAvatarPath = await updateUserProfile(request, filePath);
        if (oldAvatarPath && oldAvatarPath !== '')
        {
            try
            {
                await unlink(oldAvatarPath);
                await rmdir(dirname(oldAvatarPath)).catch(() => {});
            }
            catch(deleteError)
            {
                console.warn(deleteError);
            }
        }
        await mkdir(dirname(filePath), { recursive: true });
        await pipeline(file.file, createWriteStream(filePath));
        reply.code(200);
        return { status: 'success', message: 'file upload successful' };
    } catch (error: unknown) {
        reply.code(500);
        if (error instanceof Error)
        {
            if (error.message.includes('Unauthorized')) {
                reply.code(401);
                return { status: 'error', message: error.message.toLowerCase() };
            }
            return { status: 'error', message: 'internal server error' };
        }
        return { status: 'error', message: 'internal server error' };
    }
}

export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(multipart);

    fastify.route({
        method: 'POST',
        url: '/avatar',
        preHandler: fastify.authenticate,
        handler: uploadHandler,
        schema: {
            consumes: ['multipart/form-data'],
            response: {
                200: fastify.getSchema('https://ponggame.com/schemas/api/v1/upload/post/response-200.json'),
                400: fastify.getSchema('https://ponggame.com/schemas/api/v1/upload/post/response-400.json'),
                401: fastify.getSchema('https://ponggame.com/schemas/api/v1/upload/post/response-401.json'),
                500: fastify.getSchema('https://ponggame.com/schemas/api/v1/upload/post/response-500.json')
            }
        }
    });
});
