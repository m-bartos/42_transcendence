import {MatchWebSocket} from "../types/websocket.js";
import crypto from "crypto";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket} from "@fastify/websocket";

async function wsHandler (this:FastifyInstance, origSocket: WebSocket, req: FastifyRequest) {
    // On connection
    const socket = origSocket as MatchWebSocket;
    try {
        if (req.session_id !== undefined) {
            socket.sessionId = req.session_id;
        }
        socket.connectionId = crypto.randomUUID();
        this.matchManager.addToQueue(socket);
    } catch (error)
    {
        socket.close(1008, 'Unauthorized');
    }

    const handleDisconnect = () => {
        this.matchManager.deletePlayerFromQueue(socket);
    };

    socket.on('error', handleDisconnect);
    socket.on('close', handleDisconnect);
}

export default wsHandler;