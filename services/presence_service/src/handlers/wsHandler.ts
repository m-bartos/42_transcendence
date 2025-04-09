import {FastifyRequest} from "fastify";
import type { WebSocket } from 'ws'

export const wsHandler = async function (socket: WebSocket, request: FastifyRequest) {
    socket.send("hello from ws server");
    socket.on('message', async (msg: string) => {
        console.log(msg.toString());
    })
}