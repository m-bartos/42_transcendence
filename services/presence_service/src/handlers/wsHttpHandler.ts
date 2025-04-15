import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import storage from "../messageRouting/connectionStorage.js";


export async function wsHttpHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    try {
        const onlineUsers: string[] = storage.getAllUsers();
        reply.code(200);
        return {status: 'success', message: "current users online", data: onlineUsers};
    }
    catch (error) {
        return {status: 'error', message: 'internal server error'};
    }
}
