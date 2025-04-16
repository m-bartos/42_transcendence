import {Game} from '../models/game.js'
import {FastifyInstance} from 'fastify';
import {GameWebSocket} from "../types/websocket.js";
import {GameStatus, GameType} from "../types/game.js";

import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";

// TODO: Check the quality of the connection

const games = new Map<string, Game>();

export function createGame(gameEventPublisher: GameEventsPublisher, gameType: GameType, playerOneSessionId: string, playerTwoSessionId: string): Game {
    const game = new Game({
        gameType: gameType,
        playerOneSessionId: playerOneSessionId,
        playerTwoSessionId: playerTwoSessionId,
        gameEventPublisher: gameEventPublisher,
    });

    games.set(game.id, game);

    return game;
}

export function getGame(gameId: string): Game {
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
        if (game.status === GameStatus.Live)
        {
            game.tick();
            game.broadcastGameState();
        }
    }
}

export function broadcastPendingAndFinishedGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        if (game.status === GameStatus.Pending || game.status === GameStatus.Ended)
        {
            game.broadcastGameState();
        }
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