import { Game } from './game_class.js'
import { GameWebSocket } from '../types/game.js'
import { FastifyInstance } from 'fastify';

// TODO: Check the quality of the connection

const games = new Map<string, Game>();

export function createGame(player1Id: string, player2Id: string): Game {
    const game = new Game(player1Id, player2Id);
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
        game.getFirstPlayer().disconnect();
        game.getSecondPlayer().disconnect();
    }
    return games.delete(gameId);
}

export function broadcastLiveGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        if (game.status === 'live')
        {
            game.tick();
        }
    }
}

export function broadcastPendingAndFinishedGames(fastify: FastifyInstance): void {
    for (const game of games.values()) {
        if (game.status === 'pending' || game.status === 'finished')
        {
            game.broadcastPendingAndFinishedGames();
        }
    }
}

export function checkPendingGames(fastify: FastifyInstance): void {
    // fastify.log.info(`Checking pending games. Current count: ${games.size}`);
    
    for (const game of games.values()) {
        if (game.shouldDelete())
        {
            fastify.log.info(`Deleting game ${game.id} (status: ${game.status})`);
            game.destroy();
            games.delete(game.id);
        }
    }
    
    // fastify.log.info(`Finished checking. Remaining games: ${games.size}`);
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

    try {
        const game = getGame(websocket.gameId);
        game.connectPlayer(websocket.playerId, websocket);
        game.broadcastGameState();
    } catch (error) {
        console.error(`Error connecting player ${websocket.playerId} to game ${websocket.gameId}: `, error);
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

export function removePlayerFromGame(gameId: string, playerId: string): void {
    try {
        const game = getGame(gameId);
        game.disconnectPlayer(playerId);
        game.broadcastGameState();
    } catch (error) {
        console.error(`Error disconnecting player ${playerId} from game ${gameId}: `);
    }
}

// For testing purposes
export function clearGames(): void {
    closeAllWebSockets();
    games.clear();
}

export function getGames(): number {
    return games.size;
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