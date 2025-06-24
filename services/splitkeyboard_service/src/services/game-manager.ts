import {SplitkeyboardGame} from '../models/splitkeyboard-game.js'
import {SplitkeyboardWebSocket} from "../types/websocket.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";

export type GameManager = {
    clearGameManager: typeof clearGameManager;
    destroyEndedGames: typeof destroyEndedGames;
    isUserInAnyActiveGame: typeof isSessionInAnyActiveGame;
    getGames: typeof getGames;
};

export const gameManager: GameManager = {
    clearGameManager,
    destroyEndedGames,
    isUserInAnyActiveGame: isSessionInAnyActiveGame,
    getGames,
};

// TODO: Check the quality of the connection
const games = new Map<string, SplitkeyboardGame>();

const destroyEndedGamesInterval = setInterval(() => {
    gameManager.destroyEndedGames();
}, 500)

export function createGame(gameEventPublisher: GameEventsPublisher,
                           wsUserId: number,
                           wsSessionId: string,
                           playerOneUsername: string | undefined = undefined,
                           playerTwoUsername: string | undefined = undefined
    ): SplitkeyboardGame {

    const game: SplitkeyboardGame = new SplitkeyboardGame(wsUserId, wsSessionId, undefined, playerOneUsername, undefined, playerTwoUsername, gameEventPublisher); //
    games.set(game.id, game);
    return game;
}

function getGame(gameId: string): SplitkeyboardGame {
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

export function assignPlayerToGame(websocket: SplitkeyboardWebSocket): void {
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

export function isSessionInAnyActiveGame(desiredSessionId: string): boolean {
    for (const [, game] of games) {
        if (game.isSessionInThisActiveGame(desiredSessionId)) {
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
