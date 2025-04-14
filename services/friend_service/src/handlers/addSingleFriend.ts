import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";

interface UserBody {
    friendId: string
}


export async function addSingleFriend(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply) {
    const { friendId } = request.body;
    const { jwt_payload } = request;
    const userId: string = decryptUserId(jwt_payload?.sub);

    console.log(userId);
    console.log(friendId);

    try {
        const result = await this.dbSqlite('friends').insert({
            user_id: userId,
            friend_id: friendId,
            status: 'active',
            online_status: "offline"
        })

    }
    catch (error) {
        console.log(error);
    }

    reply.code(200);
    return {"endpoint": "addSingleFriend", payload: {friendId}};
}