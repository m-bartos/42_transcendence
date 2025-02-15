import { Game } from '../types/game.js'


// Private storage using module scope
const games = new Map<string, Game>();

// Exported functions instead of class methods
export function createGame(player1Id: string, player2Id: string): Game {
    const game: Game = {
        id: crypto.randomUUID(),
        game_state: {
            game_status: 'pending',
            paddle1: { y_cor: 50 },
            paddle2: { y_cor: 50 },
            ball: {
                x_cor: 50,
                y_cor: 50,
                size: 10
            }
        },
        player1: {
            id: player1Id,
            websocket: null
        },
        player2: {
            id: player2Id,
            websocket: null
        },
        created_at: new Date()
    };

    games.set(game.id, game);
    return game;
}

export function getGame(gameId: string): Game | undefined {
    return games.get(gameId);
}

export function removeGame(gameId: string): boolean {
    return games.delete(gameId);
}

export function sendGamesUpdate() {
    for (const [gameId, game] of games) {
        // Update game state object to send


        // Send to player1 if connected
        if (game.player1.websocket && game.player1.websocket.readyState === WebSocket.OPEN) {
            try {
                game.player1.websocket.send(JSON.stringify(game.game_state));
            } catch (error) {
                console.error(`Failed to send update to player1 in game ${gameId}:`, error);
            }
        }

        // Send to player2 if connected
        if (game.player2.websocket && game.player2.websocket.readyState === WebSocket.OPEN) {
            try {
                game.player2.websocket.send(JSON.stringify(game.game_state));
            } catch (error) {
                console.error(`Failed to send update to player2 in game ${gameId}:`, error);
            }
        }
    }
}

export function closeAllWebSockets() {
    for (const [gameId, game] of games) {
        if (game.player1.websocket && game.player1.websocket.readyState === WebSocket.OPEN) {
            game.player1.websocket.close();
            game.player1.websocket =  null;
        }
        if (game.player2.websocket && game.player2.websocket.readyState === WebSocket.OPEN) {
            game.player2.websocket.close();
            game.player2.websocket =  null;
        }
    }
}

// Export the type for use in plugin decoration
export type GameManager = {
    createGame: typeof createGame;
    getGame: typeof getGame;
    removeGame: typeof removeGame;
    sendGamesUpdate: typeof sendGamesUpdate;
    closeAllWebSockets: typeof closeAllWebSockets;
};