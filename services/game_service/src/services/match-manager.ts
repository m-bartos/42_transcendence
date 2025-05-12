// import { MatchmakingPlayer } from '../models/models-match/matchmaking-player.js';
import { MatchmakingState} from '../types/matchmaking.js';
// import {MatchWebSocket} from "../types/types-match/websocket.js";

import { gameEventsPublisher } from "../plugins/rabbitMQ-plugin.js";
import {MultiplayerGame} from "../models/multiplayer-game.js";

import * as gameManager from '../services/game-manager.js';
import {GameWebSocket} from "../types/websocket.js";
import {EventEmitter} from "node:events";

const playerQueue = new Map<number, GameWebSocket>();

const emitter = new EventEmitter();

emitter.addListener('playerAddedToQueue', (socket: GameWebSocket) => {createGameFromPlayerQueue();})
emitter.addListener('gameCreated', (game: MultiplayerGame, websocketOne: GameWebSocket, websocketTwo: GameWebSocket) => {
    gameManager.assignPlayerToGame(websocketOne);
    gameManager.assignPlayerToGame(websocketTwo);
})

export function addToQueue(socket: GameWebSocket): void {
    playerQueue.set(socket.userId, socket);
    socket.enteredQueue = Date.now();
    emitter.emit('playerAddedToQueue', socket);
}

export function createGameFromPlayerQueue(): void {
    if (playerQueue.size < 2) {
        return;
    }

    const players = Array.from(playerQueue.entries());

    while (players.length >= 2) {
        const [playerOneId, websocketOne] = players.shift()!;
        const [playerTwoId, websocketTwo] = players.shift()!;

        try
        {
            const game = createGame(websocketOne, websocketTwo);
            playerQueue.delete(playerOneId);
            playerQueue.delete(playerTwoId);
            websocketOne.gameId = game.id;
            websocketTwo.gameId = game.id;
            emitter.emit('gameCreated', game, websocketOne, websocketTwo);
        }
        catch (error) {
            console.error("Cannot create the game from 2 players in queue.");
        }
    }
}

export function createGame(websocketOne: GameWebSocket, websocketTwo: GameWebSocket): MultiplayerGame {
    try
    {
        const playerOneUserId = websocketOne.userId;
        const playerOneSessionId = websocketOne.sessionId;
        const playerOneUsername = websocketOne.username;
        const playerTwoUserId = websocketTwo.userId;
        const playerTwoSessionId = websocketTwo.sessionId;
        const playerTwoUsername = websocketTwo.username;

        if (!playerOneSessionId || !playerTwoSessionId || !playerOneUserId || !playerTwoUserId) {
            throw new Error('Cannot create game: Player sessionsIds or userIds is missing');
        }

        const game = gameManager.createGame(gameEventsPublisher, playerOneUserId, playerOneSessionId, playerOneUsername, playerTwoUserId, playerTwoSessionId, playerTwoUsername);
        return game;
    }
    catch (error)
    {
        console.error('Failed to create match:', error);
        throw error;
    }
}

function getSearchingMatchMessage(): MatchmakingState {
    return {
        status: 'searching'
    };
}

export function broadcastStatesToQueuedWebsockets(): void {
    for (const websocket of playerQueue.values()) {
        websocket.send(JSON.stringify(getSearchingMatchMessage()));
    }
}

export function deletePlayerFromQueue(socket: GameWebSocket): void {
    playerQueue.delete(socket.userId);
}

export function closeAllWebSockets(): void {
    for (const websocket of playerQueue.values()){
      websocket.close();
  }
}

export function isUserInMatchmaking(userId: number): boolean {
    return playerQueue.has(userId);

}


export function getQueuedPlayers() {

    const currentPlayers = Array.from(playerQueue.entries()).map(([playerId, player]) => {
        const timeInQueue = ((Date.now() - player.enteredQueue) / 1000).toFixed(1);
        return { playerId: player.userId, sessionId: player.sessionId, username: player.username, timeInQueue: timeInQueue };
    });

    return currentPlayers;
}

export const matchManager: MatchManager = {
    createMatch: createGame,
    createMatchesFromPlayerQueue: createGameFromPlayerQueue,
    addToQueue,
    broadcastStates: broadcastStatesToQueuedWebsockets,
    deletePlayerFromQueue,
    closeAllWebSockets,
    isUserInMatchmaking,
    getQueuedPlayers,
};

// Export types-match for plugin decoration if needed
export type MatchManager = {
    createMatch: typeof createGame;
    closeAllWebSockets: typeof closeAllWebSockets;
    broadcastStates: typeof broadcastStatesToQueuedWebsockets;
    addToQueue: typeof addToQueue;
    deletePlayerFromQueue: typeof deletePlayerFromQueue;
    createMatchesFromPlayerQueue: typeof createGameFromPlayerQueue;
    isUserInMatchmaking: typeof isUserInMatchmaking;
    getQueuedPlayers: typeof getQueuedPlayers;
};