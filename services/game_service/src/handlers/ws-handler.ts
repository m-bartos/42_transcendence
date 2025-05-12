import { GameWebSocket } from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket} from "@fastify/websocket";
import {matchManager} from "../services/match-manager.js";

async function wsHandler (this: FastifyInstance, origSocket: WebSocket, req: FastifyRequest): Promise<void> {
    // On connection
    const socket = origSocket as GameWebSocket;
    try
    {
        if (req.username && req.userId !== undefined && req.sessionId !== undefined)
        {
            socket.gameId = null;
            socket.connectionId = crypto.randomUUID();
            socket.sessionId = req.sessionId;
            socket.username = req.username;
            socket.userId = req.userId;
        }
        else
        {
            socket.close(1008, 'Unauthorized');
            return;
        }


        // TODO: import gameManager, do not use fastify instance
        if (matchManager.isUserInMatchmaking(socket.userId) || this.gameManager.isUserInAnyActiveGame(socket.userId))
        {
            socket.close(1008, 'User is already in matchmaking or in active game');
            return;
        }
        // TODO: Disconnect this user from ended game if he is in one?


        // add player to queue
        this.matchManager.addToQueue(socket);
    }
    catch (error)
    {
        socket.close(1008, 'Unauthorized');
    }

    // Handlers
    const handleMessage = (rawData: Buffer) => {
        try
        {
            const message = JSON.parse(rawData.toString());

            switch (message.type) {
                case 'movePaddle':
                    if (socket.gameId) {
                        this.gameManager.movePaddleInGame(socket.gameId, socket.userId, message.direction);
                    }
                    break;
                default:
                    this.log.warn('Unknown message type ', message.type);
            }
        }
        catch
        {
            // IGNORE
        }
    };

    const handleDisconnect = () => {
        this.matchManager.deletePlayerFromQueue(socket);
        if (socket.gameId && socket.sessionId) {
            this.gameManager.removePlayerFromGame(socket.gameId, socket.sessionId);
        }
    };

    socket.on('message', handleMessage);
    socket.on('error', handleDisconnect);
    socket.on('close', handleDisconnect);
}

export default wsHandler;