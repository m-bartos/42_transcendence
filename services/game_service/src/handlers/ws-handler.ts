import { WsParams, GameWebSocket } from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket} from "@fastify/websocket";

async function wsHandler (this: FastifyInstance, origSocket: WebSocket, req: FastifyRequest): Promise<void> {
    // On connection
    const socket = origSocket as GameWebSocket;
    try
    {
        const { gameId } = req.params as WsParams;

        if (req.username && req.userId !== undefined && req.sessionId !== undefined && gameId)
        {
            socket.gameId = gameId;
            socket.playerSessionId = req.sessionId;
            socket.username = req.username;
            socket.userId = req.userId;
        }
        else
        {
            socket.close(1008, 'Unauthorized');
        }

        this.gameManager.assignPlayerToGame(socket);
    }
    catch (error)
    {
        // propagate the errors from assignPlayerToGame
        socket.close(1008, 'Unauthorized');
    }

    // Handlers
    const handleMessage = (rawData: Buffer) => {
        try
        {
            const message = JSON.parse(rawData.toString());

            switch (message.type) {
                case 'movePaddle':
                    this.gameManager.movePaddleInGame(socket.gameId, socket.userId, message.direction);
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
        if (socket.gameId && socket.playerSessionId) {
            this.gameManager.removePlayerFromGame(socket.gameId, socket.playerSessionId);
        }
    };

    socket.on('message', handleMessage);
    socket.on('error', handleDisconnect);
    socket.on('close', handleDisconnect);
}

export default wsHandler;