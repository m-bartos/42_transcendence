import cors from "@fastify/cors";
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

const corsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    await fastify.register(cors, {
        origin: true, // or specify your frontend origin like 'http://localhost:8080'
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    })
}

export default fp(corsPlugin, {
    name: 'corsPlugin',
    fastify: '5.x'
})