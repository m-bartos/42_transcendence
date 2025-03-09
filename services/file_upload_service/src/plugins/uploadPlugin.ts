import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import multipart, {MultipartFile} from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import authenticate from "../utils/authenticate.js";


async function updateUserProfile(filePath:string)
{
    const response: Response = await fetch('http://auth_service:3000/user/avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: filePath }),
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
}


async function uploadHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const file: MultipartFile | undefined = await request.file();
    if (!file) {
        reply.code(400);
        return {status: 'error', message: 'no file uploaded'};
    }
    const filePath = `/static_data/${file.filename}`;
    await pipeline(file.file, createWriteStream(filePath));
    try
    {
        await updateUserProfile(filePath);
        reply.code(200);
        return {status: 'success', message: 'file upload successful'};
    }
    catch (error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
        {
            return {status: 'error', message: 'file upload failed'};
        }
        return {status: 'error', message: 'internal server error'};
    }
}



export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(multipart);

    fastify.route(
        {
            method: 'post',
            url: '/upload',
            preHandler: fastify.authenticate,
            handler: uploadHandler
        }
    )

});