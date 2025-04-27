import {MultiplayerGame} from '../models/multiplayer-game.js'
import {FastifyInstance} from 'fastify';
import {GameWebSocket} from "../types/websocket.js";

import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {EventEmitter} from "node:events";


// TODO: Check the quality of the connection

const games = new Map<string, MultiplayerGame>();

export function createGame(
                           gameEventPublisher: GameEventsPublisher,
                           playerOneUserId: string,
                           playerOneSessionId: string,
                           playerTwoUserId: string,
                           playerTwoSessionId: string
    ): MultiplayerGame {

    console.log("PlayerOne - user Id", playerOneUserId);
    console.log("PlayerOne - session Id", playerOneSessionId);

    console.log("PlayerTwo - user Id", playerTwoUserId);
    console.log("PlayerTwo - session Id", playerTwoSessionId);


    const game:MultiplayerGame = new MultiplayerGame(playerOneUserId, playerOneSessionId, playerTwoUserId, playerTwoSessionId, gameEventPublisher); //

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

export function removeGame(gameId: string): boolean {
    const game = games.get(gameId);
    if (game) {
        game.destroy();
    }
    return games.delete(gameId);
}

export function broadcastLiveGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        game.updateAndBroadcastLiveState();
    }
}

export function broadcastPendingAndFinishedGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        game.broadcastPendingAndFinished();
    }
}

export function checkPendingGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        if (game.shouldDelete())
        {
            fastify.log.info(`Deleting game ${game.id} (status: ${game.status})`);
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
        const game = getGame(websocket.gameId);
        game.emitConnectPlayer(websocket.playerSessionId, websocket);
    } catch (error) {
        console.error(`Error connecting player ${websocket.playerSessionId} to game ${websocket.gameId}: `, error);
    }
}

export function movePaddleInGame(gameId: string, playerId: string, direction: number): void {
    try {
        const game = getGame(gameId);
        game.movePaddle(playerId, direction);
    } catch (error) {
        console.error('Error while moving paddle of player ${playerId} in game ${gameId}: ', error);
    }
}

export function removePlayerFromGame(gameId: string, playerSessionId: string): void {
    try {
        const game = getGame(gameId);
        game.emitDisconnectPlayer(playerSessionId);

    } catch (error) {
        console.error(`Error disconnecting player ${playerSessionId} from game ${gameId}: `);
    }
}

// For testing purposes
export function clearGames(): void {
    closeAllWebSockets();
    games.clear();
}

export function getGames() {
    const currentGames = Array.from(games.entries()).map(([gameId, game]) => {
        return game.currentStatistics();
    });

    return currentGames;
}

// Export types for plugin decoration if needed
export type GameManager = {
    createGame: typeof createGame;
    getGame: typeof getGame;
    removeGame: typeof removeGame;
    broadcastLiveGames: typeof broadcastLiveGames;
    closeAllWebSockets: typeof closeAllWebSockets;
    assignPlayerToGame: typeof assignPlayerToGame;
    removePlayerFromGame: typeof removePlayerFromGame;
    clearGames: typeof clearGames;
    broadcastPendingAndFinishedGames: typeof broadcastPendingAndFinishedGames;
    movePaddleInGame: typeof movePaddleInGame;
    checkPendingGames: typeof checkPendingGames;
    getGames: typeof getGames;
};