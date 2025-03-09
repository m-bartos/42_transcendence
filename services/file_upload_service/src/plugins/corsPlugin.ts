import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin'
import cors from '@fastify/cors';

async function corsPlugin (fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    });
}

export default fp(corsPlugin);