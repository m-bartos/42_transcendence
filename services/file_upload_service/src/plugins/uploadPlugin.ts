import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import multipart, { MultipartFile } from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
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
        // Ensure the directory exists before writing the file
        await mkdir(dirname(filePath), { recursive: true });

        // Write the file to the unique path
        await pipeline(file.file, createWriteStream(filePath));

        // Update user profile with the file path
        await updateUserProfile(request, filePath);

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