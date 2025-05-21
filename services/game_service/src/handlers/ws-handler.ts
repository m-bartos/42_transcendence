import { GameWebSocket } from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket as FastifyWebSocket} from "@fastify/websocket";
import {matchManager} from "../services/match-manager.js";
import * as gameManager from '../services/game-manager.js';

async function wsHandler (this: FastifyInstance, origSocket: FastifyWebSocket, req: FastifyRequest): Promise<void> {
    // On connection
    const socket = origSocket as GameWebSocket;
    try
    {
        if (req.username && req.userId !== undefined && req.sessionId !== undefined && req.avatarLink !== undefined)
        {
            socket.gameId = null;
            socket.connectionId = crypto.randomUUID();
            socket.sessionId = req.sessionId;
            socket.username = req.username;
            socket.userId = req.userId;
            socket.avatarLink = req.avatarLink;
            socket.ready = false;
        }
        else
        {
            socket.close(1008, 'Unauthorized');
            return;
        }

        if (matchManager.isUserInMatchmaking(socket.userId) || gameManager.isUserInAnyActiveGame(socket.userId))
        {
            console.warn('Player is already in matchmaking or in active game');
            socket.close(1008, 'User is already in matchmaking or in active game');
            return;
        }

        matchManager.addToQueue(socket);
    }
    catch (error)
    {
        socket.close(1008, 'Unauthorized');
    }
}

export default wsHandler;