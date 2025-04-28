import {MatchWebSocket} from "../types/types-match/websocket.js";
import crypto from "crypto";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket} from "@fastify/websocket";

async function wsMatchHandler (this:FastifyInstance, origSocket: WebSocket, req: FastifyRequest) {
    // On connection
    // check if this sessionId and userId is not already in matchmaking and is not in any game

    const socket = origSocket as MatchWebSocket;
    try {
        if (req.sessionId !== undefined) {
            socket.sessionId = req.sessionId;
        }
        if (req.userId !== undefined) {
            socket.userId = req.userId;
        }
        socket.connectionId = crypto.randomUUID();
        this.matchManager.addToQueue(socket);


        // if (!isInMatchmaking(userId) && !isInActiveGame(userId))
        // {
        //     //  TODO: Do we want to check if this userId has active splitkeyboardgame or tournament?
        // }
        // else
        // {
        //     socket.close(1008, 'User is in matchmaking or in active game')
        // }
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

export default wsMatchHandler;