import { Game } from './game_class.js'
import { GameWebSocket } from '../types/game.js'
import {FastifyInstance} from 'fastify';

const games = new Map<string, Game>();

export function createGame(player1Id: string, player2Id: string): Game {
    const game = new Game(player1Id, player2Id);
    games.set(game.id, game);
    return game;
}

export function getGame(gameId: string): Game {
    const game = games.get(gameId);
    if (!game) {
        throw new Error('Game with specified game_id does not exist.');
    }
    return game;
}

export function removeGame(gameId: string): boolean {
    const game = games.get(gameId);
    if (game) {
        game.getFirstPlayer().disconnect();
        game.getSecondPlayer().disconnect();
    }
    return games.delete(gameId);
}

export function sendGamesUpdate(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        game.tick();
        const message = JSON.stringify(game.getCurrentState());
        // fastify.log.debug(message);
    }
}

export function closeAllWebSockets(): void {
    for (const game of games.values()) {
        game.getFirstPlayer().disconnect();
        game.getSecondPlayer().disconnect();
    }
}

export function assignPlayerToGame(websocket: GameWebSocket): void {
    // TODO: HARDCODED
    try
    {
        getGame(websocket.gameId);
    }
    catch
    {
        createGame('test1', 'test2');
    }


    const game: Game = getGame(websocket.gameId);

    game.connectPlayer(websocket.playerId, websocket);
}

export function removePlayerFromGame(gameId: string, playerId: string): void {
    const game = getGame(gameId);

    game.disconnectPlayer(playerId);
}

// For testing purposes
export function clearGames(): void {
    closeAllWebSockets();
    games.clear();
}

// Export types for plugin decoration if needed
export type GameManager = {
    createGame: typeof createGame;
    getGame: typeof getGame;
    removeGame: typeof removeGame;
    sendGamesUpdate: typeof sendGamesUpdate;
    closeAllWebSockets: typeof closeAllWebSockets;
    assignPlayerToGame: typeof assignPlayerToGame;
    removePlayerFromGame: typeof removePlayerFromGame;
    clearGames: typeof clearGames;
};