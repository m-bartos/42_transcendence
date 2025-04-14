import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

export async function getAllFriends(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    reply.code(200);
    return {"endpoint": "getAllFriends"};
}