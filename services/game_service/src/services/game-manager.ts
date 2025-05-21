import {MultiplayerGame} from '../models/multiplayer-game.js'
import {GameWebSocket} from "../types/websocket.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";

export type GameManager = {
    clearGameManager: typeof clearGameManager;
    destroyEndedGames: typeof destroyEndedGames;
    isUserInAnyActiveGame: typeof isUserInAnyActiveGame;
    getGames: typeof getGames;
};

export const gameManager: GameManager = {
    clearGameManager,
    destroyEndedGames,
    isUserInAnyActiveGame,
    getGames,
};

// TODO: Check the quality of the connection
const games = new Map<string, MultiplayerGame>();

const destroyEndedGamesInterval = setInterval(() => {
    gameManager.destroyEndedGames();
}, 500)

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

function getGame(gameId: string): MultiplayerGame {
    const game = games.get(gameId);
    if (!game) {
        throw new Error('Game with specified gameId does not exist.');
    }
    return game;
}

function destroyEndedGames(): void {
    for (const game of games.values()) {
        if (game.shouldDelete())
        {
            game.destroy();
            games.delete(game.id);
        }
    }
}

function destroyAllGames(): void {
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

export function clearGameManager(): void {
    destroyAllGames();
    games.clear();
    clearInterval(destroyEndedGamesInterval);
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
