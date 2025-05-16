import {MultiplayerGame} from '../models/multiplayer-game.js'
import {FastifyInstance} from 'fastify';
import {GameWebSocket} from "../types/websocket.js";

import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";


// TODO: Check the quality of the connection

const games = new Map<string, MultiplayerGame>();

export function createGame(
                           gameEventPublisher: GameEventsPublisher,
                           playerOneUserId: number,
                           playerOneSessionId: string,
                           playerOneUsername: string | undefined = undefined,
                           playerTwoUserId: number,
                           playerTwoSessionId: string,
                           playerTwoUsername: string | undefined = undefined
    ): MultiplayerGame {


    const game:MultiplayerGame = new MultiplayerGame(playerOneUserId, playerOneSessionId, playerOneUsername, playerTwoUserId, playerTwoSessionId, playerTwoUsername, gameEventPublisher); //

    games.set(game.id, game);

    return game;
}

export function getGame(gameId: string): MultiplayerGame {
    const game = games.get(gameId);

    if (!game) {
        throw new Error('Game with specified gameId does not exist.');
    }

    return game;
}

// export function removeGame(gameId: string): boolean {
//     const game = games.get(gameId);
//     if (game) {
//         game.destroy();
//     }
//     return games.delete(gameId);
// }

// TODO: Functionality will be moved to multiplayer game class and this fnc will be deleted
export function broadcastLiveGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        game.updateAndBroadcastLiveState();
    }
}

// TODO: Functionality will be moved to multiplayer game class and this fnc will be deleted
export function broadcastPendingAndFinishedGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        game.broadcastGameEnded();
    }
}

// TODO: Part of the functionality will be moved to multiplayer game class and this fnc will be reduced using event emitter to delete the game from games map.
export function checkPendingGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        if (game.shouldDelete())
        {
            fastify.log.info(`Deleting game ${game.id}`);
            game.destroy();
            games.delete(game.id);
        }
    }
}

export function closeAllWebSockets(): void {
    for (const game of games.values()) {
        game.destroy();
    }
}

export function assignPlayerToGame(websocket: GameWebSocket): void {
    try {
        if (!websocket.gameId) {
            throw new Error(`This connection ${websocket.connectionId} does not belong to any game. Please close the connection and try again.`);
        }
        const game = getGame(websocket.gameId);
        game.emitConnectPlayer(websocket.sessionId, websocket);
    } catch (error) {
        console.error(`Error connecting player ${websocket.sessionId} to game ${websocket.gameId}: `, error);
    }
}

// TODO: Functionality will be moved to multiplayer game class and this fnc will be deleted
export function movePaddleInGame(gameId: string, userId: number, direction: number): void {
    try {
        const game = getGame(gameId);
        game.movePaddle(userId, direction);
    } catch (error) {
        console.error('Error while moving paddle of player ${playerId} in game ${gameId}: ', error);
    }
}

// export function removePlayerFromGame(gameId: string, playerSessionId: string): void {
//     try {
//         const game = getGame(gameId);
//         game.emitDisconnectPlayer(playerSessionId);
//
//     } catch (error) {
//         console.error(`Error disconnecting player ${playerSessionId} from game ${gameId}: `);
//     }
// }

// For testing purposes
export function clearGames(): void {
    closeAllWebSockets();
    games.clear();
}


export function isUserInAnyActiveGame(desiredUserId: number): boolean {
    for (const [, game] of games) {
        if (game.isUserInThisActiveGame(desiredUserId)) {
            return true;
        }
    }
    return false;
}

export function getGames() {
    const currentGames = Array.from(games.entries()).map(([gameId, game]) => {
        return game.getBasicState();
    });

    return currentGames;
}

// Export types-match for plugin decoration if needed
export type GameManager = {
    createGame: typeof createGame;
    getGame: typeof getGame;
    // removeGame: typeof removeGame;
    broadcastLiveGames: typeof broadcastLiveGames;
    closeAllWebSockets: typeof closeAllWebSockets;
    assignPlayerToGame: typeof assignPlayerToGame;
    // removePlayerFromGame: typeof removePlayerFromGame;
    clearGames: typeof clearGames;
    broadcastPendingAndFinishedGames: typeof broadcastPendingAndFinishedGames;
    movePaddleInGame: typeof movePaddleInGame;
    checkPendingGames: typeof checkPendingGames;
    isUserInAnyActiveGame: typeof isUserInAnyActiveGame;
    getGames: typeof getGames;
};