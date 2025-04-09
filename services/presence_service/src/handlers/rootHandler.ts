import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

export const rootHandler = async function (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    reply.code(200);
    return {serviceName: 'presenceService'}
}