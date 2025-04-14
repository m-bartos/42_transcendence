import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";

interface UserBody {
    friend: {
        userId: string;
    }
}


export async function removeSingleFriend(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply) {
    const { friend } = request.body

    reply.code(200);
    return {"endpoint": "removeSingleFriend", payload: {friend}};
}