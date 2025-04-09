import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

export async function wsHttpHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    reply.code(200);
    return {response: "http wsHttpHandler"};
}
