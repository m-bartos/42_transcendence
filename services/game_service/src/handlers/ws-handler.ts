import { GameWebSocket } from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket} from "@fastify/websocket";
import {matchManager} from "../services/match-manager.js";
import {WsClientMessage, WsClientEvent, WsDataMovePaddle} from "../types/ws-client-messages.js";
import {WsDataOpponentFound} from "../types/ws-server-messages.js";

async function wsHandler (this: FastifyInstance, origSocket: WebSocket, req: FastifyRequest): Promise<void> {
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

        // TODO: import gameManager, do not use fastify instance
        if (matchManager.isUserInMatchmaking(socket.userId) || this.gameManager.isUserInAnyActiveGame(socket.userId))
        {
            console.error('Player is already in matchmaking or in active game');
            socket.close(1008, 'User is already in matchmaking or in active game');
            return;
        }

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
            const message = JSON.parse(rawData.toString()) as WsClientMessage;

            switch (message.event) {
                // TODO: move MovePaddle message listener to multiplayerGame class
                case WsClientEvent.MovePaddle:
                    const data = message.data as WsDataMovePaddle;
                    if (socket.gameId) {
                        this.gameManager.movePaddleInGame(socket.gameId, socket.userId, data.direction);
                    }
                    break;
                case WsClientEvent.LeaveMatchmaking: //TODO: Move to matchmaking model(s) => playersQueue and pendingMatches
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        //send player left message
                        socket.close(1000, 'User left matchmaking');
                    }
                    break;
                default:
            }
        }
        catch
        {
            // IGNORE
        }
    };

    const handleDisconnect = () => {
        this.matchManager.deletePlayerFromQueue(socket); // TODO: move playerQueue with all socket on events to separate module
    };

    socket.on('message', handleMessage);
    socket.on('error', handleDisconnect);
    socket.on('close', handleDisconnect);
}

export default wsHandler;