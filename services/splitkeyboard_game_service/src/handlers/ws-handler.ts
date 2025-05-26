import {SplitkeyboardWebSocket} from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket as FastifyWebSocket} from "@fastify/websocket";
import * as gameManager from '../services/game-manager.js';
import {WsClientDataProperties, WsClientEvent, WsClientMessage} from "../types/ws-client-messages.js";
import {createGame} from "../services/game-manager.js";
import {gameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";

async function wsHandler (this: FastifyInstance, origSocket: FastifyWebSocket, req: FastifyRequest): Promise<void> {
    // On connection
    const socket = origSocket as SplitkeyboardWebSocket;
    let timeout: NodeJS.Timeout | undefined; // Declare timeout outside try-catch

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
            socket.isAlive = false;
        }
        else
        {
            socket.close(1008, 'Unauthorized');
            return;
        }

        if (gameManager.isSessionInAnyActiveGame(socket.sessionId))
        {
            console.warn('Players sessionId is already in active game');
            socket.close(1008, 'Already in active game');
            return;
        }

        // Set 5-second timeout for initial message
        timeout = setTimeout(() => {
            if (!socket.isAlive) {
                console.log(`No message received within 5 seconds for connection ${socket.connectionId}, closing`);
                socket.close(1007, 'No initial message received');
            }
        }, 5000);

        socket.once('message', (message) => {
            socket.isAlive = true; // Mark as alive on message receipt
            if (timeout) {
                clearTimeout(timeout); // Clear timeout since message was received
                timeout = undefined;
            }

            try
            {
                const gameProperties = JSON.parse(message.toString()) as WsClientMessage;

                if (gameProperties.event === WsClientEvent.GameProperties)
                {
                    const data = gameProperties.data as WsClientDataProperties;

                    if (!data.playerTwoUsername || !data.playerOneUsername)
                    {
                        throw new Error('Player usernames are missing');
                    }

                    const game = gameManager.createGame(gameEventsPublisher,socket.userId, socket.sessionId, data.playerOneUsername, data.playerTwoUsername);
                    socket.gameId = game.id;
                    gameManager.assignPlayerToGame(socket);
                }

            }
            catch (error)
            {
                console.error(`Error parsing message from client: ${error}`);
                socket.close (1007, 'Incorrect initial message received')
            }
        });

        // Handle connection close
        socket.on('close', () => {
            if (timeout) {
                clearTimeout(timeout); // Clear timeout since message was received
                timeout = undefined;
            }
            console.log(`Connection ${socket.connectionId} closed`);
        });

        // Handle errors
        socket.on('error', (error) => {
            if (timeout) {
                clearTimeout(timeout); // Clear timeout since message was received
                timeout = undefined;
            }
            console.error(`WebSocket error for connection ${socket.connectionId}:`, error);
            if (socket.readyState === socket.OPEN) {
                socket.close(1011, 'Internal server error');
            }
        });
    }
    catch (error)
    {
        if (timeout) {
            clearTimeout(timeout); // Clear timeout since message was received
            timeout = undefined;
        }
        console.error(`Error in WebSocket handler for connection ${socket.connectionId}:`, error);
        socket.close(1008, 'Unauthorized');
    }
}

export default wsHandler;