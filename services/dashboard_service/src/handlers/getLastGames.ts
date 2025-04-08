import type {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

export async function getLastGames(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    reply.code(200);
    return {lastGames: "some games"};
}