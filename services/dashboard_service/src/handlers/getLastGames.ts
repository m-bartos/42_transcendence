import type {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";

export async function getWins(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const encryptedUserId: string = request.jwt_payload.sub
    const reqId = decryptUserId(encryptedUserId);

    const result : number [] = await this.dbSqlite('game_results').select("*").where({winner_id: reqId});

    reply.code(200);
    return {lastGames: "won games", req: reqId, data: {result: result}};
}