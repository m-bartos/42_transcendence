import {FastifyInstance, FastifyRequest} from "fastify";

export interface UserId {
    user_id: number;
}

export async function getUserId(instance:FastifyInstance, request: FastifyRequest): Promise<UserId | undefined> {
    return instance.dbSqlite('sessions').select('user_id').where({session_id: request.session_id, revoked: false}).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").first();
}