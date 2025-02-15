interface Game {
    id: string;
    player1: { id: string };
    player2: { id: string };
    created_at: Date;
}
// Private storage using module scope
const games = new Map<string, Game>();

// Exported functions instead of class methods
export function createGame(player1Id: string, player2Id: string): Game {
    const game: Game = {
        id: crypto.randomUUID(),
        player1: { id: player1Id },
        player2: { id: player2Id },
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

// Export the type for use in plugin decoration
export type GameManager = {
    createGame: typeof createGame;
    getGame: typeof getGame;
    removeGame: typeof removeGame;
};