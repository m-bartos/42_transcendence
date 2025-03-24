import { WsQuery, WsParams, GameWebSocket } from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket} from "@fastify/websocket";

async function wsHandler (this: FastifyInstance, origSocket: WebSocket, req: FastifyRequest): Promise<void> {
    // On connection
    const socket = origSocket as GameWebSocket;
    try
    {
        const { gameId } = req.params as WsParams;

        if (req.username && req.playerId !== undefined && req.session_id !== undefined && gameId)
        {
            socket.gameId = gameId;
            socket.playerSessionId = req.session_id;
            socket.username = req.username;
            socket.playerId = req.playerId;
        }
        else
        {
            socket.close(1008, 'Unauthorized');
        }
        // console.log(socket);
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
                    this.gameManager.movePaddleInGame(socket.gameId, socket.playerSessionId, message.direction);
                    break;
                default:
                    this.log.warn('Unknown message type ', message.type);
                    // send "invalid message" to client?
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
    socket.on('close', handleDisconnect);3
}

// Suggested helper function

export default wsHandler;