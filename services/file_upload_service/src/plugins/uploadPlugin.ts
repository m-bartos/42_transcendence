import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import multipart, { MultipartFile } from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import {createWriteStream} from 'node:fs';
import { randomUUID } from 'node:crypto';
import {mkdir, rmdir, unlink} from 'node:fs/promises';
import { dirname } from 'node:path';

async function updateUserProfile(request: FastifyRequest, filePath: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // 1.5 seconds

    try {
        const response: Response = await fetch('http://auth_service:3000/user/internal/avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: filePath, sessionId: request.session_id }),
            signal: controller.signal // Attach the abort signal
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response;
    } catch (error: unknown) {
        throw error; // Re-throw to handle in uploadHandler
    } finally {
        clearTimeout(timeout); // Clean up the timeout if fetch completes or fails early
    }
}


async function uploadHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const file: MultipartFile | undefined = await request.file();

    if (!file || file.fieldname !== 'upload') {
        reply.code(400);
        return { status: 'error', message: 'invalid payload or field name' };
    }
    const uniqueDir = randomUUID();
    const filePath = `/static_data/${uniqueDir}/${file.filename}`;
    try {
        await updateUserProfile(request, filePath); // This now times out after 3s
        await mkdir(dirname(filePath), { recursive: true });
        await pipeline(file.file, createWriteStream(filePath));
        reply.code(200);
        return { status: 'success', message: 'file upload successful' };
    } catch (error: unknown) {
        reply.code(500);
        if (error instanceof Error) {
            if (error.message.includes('Unauthorized')) {
                reply.code(401);
                return { status: 'error', message: error.message.toLowerCase() };
            }
            // Handle AbortError specifically if needed
            if (error.name === 'AbortError') {
                return { status: 'error', message: 'internal service timeout' };
            }
            return { status: 'error', message: 'internal server error' };
        }
        return { status: 'error', message: 'internal server error' };
    }
}

export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(multipart, {
        limits: {
            fieldNameSize: 100, // Max field name size in bytes
            fieldSize: 100,     // Max field value size in bytes
            fields: 0,         // Max number of non-file fields
            fileSize: 1000000, // For multipart forms, the max file size in bytes - 1M
            files: 1,           // Max number of file fields
            headerPairs: 2000,  // Max number of header key=>value pairs
            parts: 1000         // For multipart forms, the max number of parts (fields + files)
        }
    });

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
