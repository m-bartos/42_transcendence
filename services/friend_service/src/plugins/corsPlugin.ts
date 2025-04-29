import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin'
import cors from '@fastify/cors';

async function corsPlugin (fastify: FastifyInstance, options: FastifyPluginOptions) {
    await fastify.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    });
}

export default fp(corsPlugin);