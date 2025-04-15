import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import { decryptUserId } from "../utils/secureUserId.js";
import { UserRecord } from "./addSingleFriend.js";

export async function getAllFriends(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { jwt_payload } = request;

    try {
        const userId = decryptUserId(jwt_payload?.sub);
        const friends: UserRecord[] = await this.dbSqlite('friends').select("user_id", "friend_id", "online_status").where({user_id: userId, status: 'active'});
        reply.code(200);
        return {status: "success", message: "friends list", data: friends};
    }
    catch (error) {
        reply.code(500);
        return {status: "error", message: 'internal server error'};
    }
}