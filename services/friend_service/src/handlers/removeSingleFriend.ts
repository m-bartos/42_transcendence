import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";

interface UserBody {
        friend_id: string;
}

export async function removeSingleFriend(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply) {
    const { sub } = request.jwt_payload
    const { friend_id } = request.body
    try
    {
        const userId = decryptUserId(sub);
        const result: number = await this.dbSqlite('friends').where({user_id: userId ,friend_id : friend_id}).del();
        if (result > 0)
        {
            reply.code(200);
            return {status: "success", message: "friend removed" ,data: {friend_id: friend_id}};
        }
        reply.code(404);
        return {status: "error", message: `user not found`};
    }
    catch (error) {
        reply.code(500);
        return {status: "error", message: "internal server error"};
    }
}