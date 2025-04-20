import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { decryptUserId } from "../utils/secureUserId.js";

interface RequestBody {
    userId: string;
    pagination: {
        limit: number;
        offset: number;
    }
}

const requestBodySchema = {
    userId: "userId",
    pagination: {
        limit: "number",
        offset: "number"
    }
}

const responseData = {
    data: [],
    pagination: {}
}

export async function getSplitKeyboardGames(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const encryptedUserId: string = request.jwt_payload.sub
    const authUserId: string = decryptUserId(encryptedUserId);
    const {userId, pagination} = request.body as RequestBody;
    console.log('User Id:',userId);
    console.log('Pagination:',pagination);

    // transform to functions
    let limit = parseInt(pagination.limit.toString(), 10) || 20;
    let offset = parseInt(pagination.offset.toString(), 10) || 0;

    // transform to functions
    limit  = Math.min(Math.max(limit, 1), 100);
    offset = Math.max(offset, 0);

    try
    {
        // get number of records
        const result = await this.dbSqlite('split_keyboard_results').where(function () {this.where('player_one_id', userId).orWhere('player_two_id', userId);}).count('* as count');
        const count = result[0].count;
        const total = Number(count);
        const games = await this.dbSqlite('split_keyboard_results').select('*').where({player_one_id: userId}).orWhere({player_two_id: userId}).orderBy('created_at', 'desc').limit(limit).offset(offset);

        // build pagination data - need to review this build function
        const hasPrev = offset > 0;
        const hasNext = offset + games.length < total;
        const prevOffset = hasPrev ? Math.max(offset - limit, 0) : 0;
        const nextOffset = hasNext ? offset + limit : offset;

        const responsePagination = {
            limit,
            offset,
            total,
            hasPrev,
            hasNext,
            prevOffset,
            nextOffset,
        }

        reply.code(200);
        return {status: "success", message: 'split keyboard games in descending order', data: {games: games, pagination: responsePagination}};

    }
    catch (error) {
        reply.code(500);
        return {status: 'error', message: error};
    }

}