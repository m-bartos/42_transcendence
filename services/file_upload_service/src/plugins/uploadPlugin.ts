import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';


export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(multipart);

    fastify.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
        const file = await request.file();
        if (!file)
        {
            reply.code(400);
            return {status: "error", message: "No file uploaded"};
        }


        console.log({
            fieldname: file.fieldname,
            filename: file.filename,
            mimetype: file.mimetype,
            encodingType: file.encoding,
        });
        // Stream the file to disk
        const filePath = `/static_data/${file.filename}`;
        await pipeline(file.file, createWriteStream(filePath));

        // await fetch('http://auth_service:3000/avatar', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     // @ts-ignore
        //     body: {file: filePath},
        // });

        reply.code(200);
        return { message: 'File uploaded successfully' };
    })
});