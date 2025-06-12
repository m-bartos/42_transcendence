import {SplitkeyboardWebSocket} from "../types/websocket.js";
import {FastifyInstance, FastifyRequest} from "fastify";
import {WebSocket as FastifyWebSocket} from "@fastify/websocket";
import * as gameManager from '../services/game-manager.js';
import {gameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {dbSqlite} from "../services/knex-db-connection.js";
import {TournamentGameStatus} from "../types/tournament.js";
import {getUsernamesByGameId} from "../utils/tournament-utils.js";

async function updateGameToLive(gameId: string) {

    const row = await dbSqlite('tournament_games').where({'game_id': gameId, 'status': TournamentGameStatus.Pending })
        .update({'status': TournamentGameStatus.Live});

    console.log(row);
}

async function wsHandler (this: FastifyInstance, origSocket: FastifyWebSocket, req: FastifyRequest): Promise<void> {
    // On connection
    const socket = origSocket as SplitkeyboardWebSocket;
    let timeout: NodeJS.Timeout | undefined; // Declare timeout outside try-catch

    try
    {
        if (req.gameId !== undefined && req.userId !== undefined && req.sessionId !== undefined)
        {
            socket.gameId = req.gameId;
            socket.connectionId = crypto.randomUUID();
            socket.sessionId = req.sessionId;
            // socket.username = req.username;
            socket.userId = req.userId;
            // socket.avatarLink = req.avatarLink;
            socket.isAlive = true;
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

        try
        {
            const { playerOneUsername, playerTwoUsername } = await getUsernamesByGameId(socket.userId, socket.gameId);

            if (!playerOneUsername || !playerTwoUsername)
            {
                console.warn('Pending game not found');
                socket.close(1008, 'Game not found');
                return;
            }

            // TODO: UNCOMMENT THIS
            // await updateGameToLive(socket.gameId);

            const game = gameManager.createGame(socket.gameId, gameEventsPublisher,socket.userId, socket.sessionId, playerOneUsername, playerTwoUsername);
            socket.gameId = game.id;
            gameManager.assignPlayerToGame(socket);
        }
        catch (error)
        {
            console.error(`Error parsing message from client: ${error}`);
            socket.close (1007, 'Game not found')
        }

        // Handle connection close
        socket.on('close', () => {
            console.log(`Connection ${socket.connectionId} closed`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`WebSocket error for connection ${socket.connectionId}:`, error);
            if (socket.readyState === socket.OPEN) {
                socket.close(1011, 'Internal server error');
            }
        });
    }
    catch (error)
    {
        console.error(`Error in WebSocket handler for connection ${socket.connectionId}:`, error);
        socket.close(1008, 'Unauthorized');
    }
}

export default wsHandler;