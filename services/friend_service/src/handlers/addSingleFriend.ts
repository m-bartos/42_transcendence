import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import { decryptUserId } from "../utils/secureUserId.js";

interface UserBody {
    friend_id: string
}

export interface UserRecord
{
    id: string;
    user_id: string;
    friend_id: string;
    status: string;
    online_status: string;
    created_at: string;
    updated_at: string;
}

export async function addSingleFriend(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply) {
    const { friend_id } = request.body;
    const { jwt_payload } = request;
    const userId: string = decryptUserId(jwt_payload?.sub);

    try {
        const result: number[] = await this.dbSqlite('friends').insert({
            user_id: userId,
            friend_id: friend_id,
            status: 'active',
            online_status: "offline"
        })

        const userRecord: UserRecord = await this.dbSqlite('friends').where('id', result[0]).first();
        const response = {
            user_id: userRecord.user_id,
            friend_id: userRecord.friend_id,
            online_status: userRecord.online_status,
            created_at: userRecord.created_at
        }
        reply.code(201);
        return {status: 'success', message: "new friend added", data: response};
    }
    catch (error: any) {
        if (error.code === "SQLITE_CONSTRAINT"
            || (error.message && error.message.includes("UNIQUE constraint failed: friends.user_id, friends.friend_id"))) {
            reply.code(409);
            return { status: "error", message: "You are already friends with the user." };
        }
        reply.code(500);
        return { status: "error", message: "Internal server error" };
    }
}