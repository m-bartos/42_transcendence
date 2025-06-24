// import { MatchmakingPlayer } from '../models/models-match/matchmaking-player.js';
// import {MatchWebSocket} from "../types/types-match/websocket.js";
import {gameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {MultiplayerGame} from "../models/multiplayer-game.js";

import * as gameManager from '../services/game-manager.js';
import {GameWebSocket} from "../types/websocket.js";
import {PendingMatch} from "../models/pending-match.js";
import WebSocket from 'ws';
import {MatchmakingEvents} from "../types/matchmaking-events.js";
import {
    addToQueue,
    closeAllWebSocketsInPlayerQueue,
    deletePlayerFromQueue,
    deleteSocketFromPlayerQueue,
    destroyPlayerQueue,
    getQueuedPlayers,
    playerQueue
} from "./player-queue.js";
import {matchMakingEmitter} from "./match-making-emitter.js";

export const matchManager: MatchManager = {
    // createMatch: createGame,
    // createMatchesFromPlayerQueue: createGameFromPendingMatch,
    addToQueue,
    // broadcastStates: broadcastStatesToPlayerQueueWebsockets,
    deletePlayerFromQueue,
    closeAllWebSockets: closeAllWebSocketsInPlayerQueue,
    isUserInMatchmaking,
    getQueuedPlayers,
    getPendingMatches,
    destroy
};

// Export types-match for plugin decoration if needed
export type MatchManager = {
    // createMatch: typeof createGame;
    closeAllWebSockets: typeof closeAllWebSocketsInPlayerQueue;
    // broadcastStates: typeof broadcastStatesToPlayerQueueWebsockets;
    addToQueue: typeof addToQueue;
    deletePlayerFromQueue: typeof deletePlayerFromQueue;
    // createMatchesFromPlayerQueue: typeof createGameFromPendingMatch;
    isUserInMatchmaking: typeof isUserInMatchmaking;
    getQueuedPlayers: typeof getQueuedPlayers;
    getPendingMatches: typeof getPendingMatches;
    destroy: typeof destroy;
};

const pendingMatches = new Map<string, PendingMatch>();

matchMakingEmitter.addListener(MatchmakingEvents.PlayerAddedToQueue, (socket: GameWebSocket) => {createPendingMatch();})
matchMakingEmitter.addListener(MatchmakingEvents.PendingMatchReady, (matchId: string) => {createGameFromPendingMatch(matchId);})
matchMakingEmitter.addListener(MatchmakingEvents.PendingMatchTimeout, (matchId: string) => {pendingMatchRefused(matchId);})
matchMakingEmitter.addListener(MatchmakingEvents.PendingMatchRefused, (matchId: string) => {pendingMatchRefused(matchId);})
matchMakingEmitter.addListener(MatchmakingEvents.GameCreated, (game: MultiplayerGame, websocketOne: GameWebSocket, websocketTwo: GameWebSocket) => {
    gameManager.assignPlayerToGame(websocketOne);
    gameManager.assignPlayerToGame(websocketTwo);
})

export function destroy(): void {
    destroyPlayerQueue();
    pendingMatches.forEach((pendingMatch) => {pendingMatch.destroy();});
    pendingMatches.clear();
    matchMakingEmitter.removeAllListeners();
}

function createPendingMatch(): void {
    if (playerQueue.size < 2) {
        return;
    }
    const players = Array.from(playerQueue.entries());
    while (players.length >= 2) {
        const [playerOneId, websocketOne] = players.shift()!;
        const [playerTwoId, websocketTwo] = players.shift()!;

        const pendingMatch = new PendingMatch(matchMakingEmitter, websocketOne, websocketTwo);
        pendingMatches.set(pendingMatch.id, pendingMatch);

        deleteSocketFromPlayerQueue(websocketOne);
        deleteSocketFromPlayerQueue(websocketTwo);
    }
}

function pendingMatchRefused(pendingMatchId: string): void {
    const match = pendingMatches.get(pendingMatchId);
    if (!match) { return; }
    if (match.websocketOne.readyState === WebSocket.OPEN) {
        addToQueue(match.websocketOne);
    }
    if (match.websocketTwo.readyState === WebSocket.OPEN) {
        addToQueue(match.websocketTwo);
    }
    pendingMatches.delete(pendingMatchId);
    match.destroy();
}

function createGameFromPendingMatch(pendingMatchId: string): void {
    const pendingMatch = pendingMatches.get(pendingMatchId);

    if (!pendingMatch) {
        console.error("Cannot find pending match with id: ", pendingMatchId);
        return;
    }

    try
    {
        const websocketOne = pendingMatch.websocketOne;
        const websocketTwo = pendingMatch.websocketTwo;
        const game = createGame(websocketOne, websocketTwo);
        websocketOne.gameId = game.id;
        websocketTwo.gameId = game.id;
        pendingMatches.delete(pendingMatchId);
        pendingMatch.destroy();
        matchMakingEmitter.emit(MatchmakingEvents.GameCreated, game, websocketOne, websocketTwo);
    }
    catch (error) {
        console.error(`Cannot create the game from pending Match with id ${pendingMatch.id}.`);
    }
}

function createGame(websocketOne: GameWebSocket, websocketTwo: GameWebSocket): MultiplayerGame {
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

export function isUserInMatchmaking(userId: number): boolean {
    if (playerQueue.has(userId))
    {
        return true;
    }
    if (Array.from(pendingMatches.values()).some((pendingMatch) => pendingMatch.hasUserId(userId)))
    {
        return true;
    }
    return false;
}

export function getPendingMatches() {
    const currentMatches = Array.from(pendingMatches.entries()).map(([matchId, match]) => {
        return { matchId: match.id, playerOneUsername: match.websocketOne.username, playerTwoUsername: match.websocketTwo.username };
    });

    return currentMatches;
}
