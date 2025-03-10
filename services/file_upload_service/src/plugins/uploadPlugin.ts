import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import multipart, { MultipartFile } from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import {createWriteStream} from 'node:fs';
import { randomUUID } from 'node:crypto';
import {mkdir, rmdir, unlink} from 'node:fs/promises';
import { dirname } from 'node:path';

async function updateUserProfile(request: FastifyRequest, filePath: string) {
    const response: Response = await fetch('http://auth_service:3000/user/avatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: filePath, sessionId: request.session_id }),
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    // Parse the JSON response
    const body = await response.json() as { data?: { avatar: string } };
    return body.data?.avatar; // Return old avatar path if it exists
}

async function uploadHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const file: MultipartFile | undefined = await request.file();
    if (!file) {
        reply.code(400);
        return { status: 'error', message: 'no file uploaded' };
    }

    // Generate a unique file path
    const uniqueDir = randomUUID();
    const filePath = `/static_data/${uniqueDir}/${file.filename}`;

    try {
        await mkdir(dirname(filePath), { recursive: true });

        await pipeline(file.file, createWriteStream(filePath));

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
        reply.code(200);
        return { status: 'success', message: 'file upload successful' };
    } catch (error: unknown) {
        reply.code(500);
        if (error instanceof Error) {
            if (error.message.includes('Unauthorized')) {
                reply.code(401);
            }
            return { status: 'error', message: error.message };
        }
        return { status: 'error', message: 'internal server error' };
    }
}

export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(multipart);

    fastify.route({
        method: 'POST',
        url: '/upload',
        preHandler: fastify.authenticate,
        handler: uploadHandler,
    });
});