import { FastifyInstance } from 'fastify';
import { Match } from '../models/match.js';
import { Player } from '../models/player.js';
import {GameCreateBody, MatchmakingState} from '../types/matchmaking.js';
import { create } from 'domain';
import { sendRabbitMQMessage } from './rabbitMQ-client.js';
import {MatchWebSocket} from "../types/websocket.js";

const playerQueue = new Map<string, Player>();
const matches = new Map<string, Match>();


export function addToQueue(socket: MatchWebSocket): void {
    const player = new Player(socket);
    playerQueue.set(socket.connectionId, player);
}

export async function createMatchesFromPlayerQueue(): Promise<void> {
    if (playerQueue.size < 2) {
      return;
    }

    const players = Array.from(playerQueue.entries());

    while (players.length >= 2) {
      const [playerOneId, playerOne] = players.shift()!;
      const [playerTwoId, playerTwo] = players.shift()!;

      try
      {
          const match = await createMatch(playerOne, playerTwo);
          playerQueue.delete(playerOneId);
          playerQueue.delete(playerTwoId);
          matches.set(match.gameId, match);
      }
      catch (error) {
        console.log("Cannot create the match");
      }
    }
  }

// Function to create a game
async function createGame(playerOneSessionId: string, playerTwoSessionId: string): Promise<any> {
    try {
      const response = await fetch('http://game_service:3000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerOneSessionId: playerOneSessionId,
          playerTwoSessionId: playerTwoSessionId
        })
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  }
  

export async function createMatch(playerOne: Player, playerTwo: Player): Promise<Match> {
    try
    {
        const playerOneSessionId: string | null = playerOne.websocket.sessionId;
        const playerTwoSessionId: string | null  = playerTwo.websocket.sessionId;

        if (!playerOneSessionId || !playerTwoSessionId) {
            throw new Error('Cannot create match: Player username is missing');
        }
        const game = await createGame(playerOneSessionId, playerTwoSessionId);
        const match = new Match(playerOne, playerTwo, game.data.gameId);
        return match;
    }
    catch (error)
    {
        console.error('Failed to create match:', error);
        throw new Error(`Failed to create match: ${error}`);
    }
}

export function getMatch(gameId: string): Match {
    const match = matches.get(gameId);

    if (!match) {
        throw new Error('Match with specified gameId does not exist.');
    }

    return match;
}

export function removeMatch(gameId: string): boolean {
    const match = matches.get(gameId);
    if (match) {
        match.getFirstPlayer().disconnect();
        match.getSecondPlayer().disconnect();
    }
    return matches.delete(gameId);
}

function getSearchingMatchMessage(): MatchmakingState {
    return {
        status: 'searching',
        gameId: null
    };
}


export function broadcastStates(): void {
    for (const match of matches.values()) {
        match.broadcastMatchState();
    }
    for (const player of playerQueue.values()){
        const message = {
            status: 'searching',
        }
        player.sendMessage(JSON.stringify(getSearchingMatchMessage()));
    }
}


// export function broadcastStateOfMatchmakingService(): void {
//     if (playerQueue.size !== 0 || matches.size !== 0)
//     {
//         console.log('[' + Date.now().toString() + '] Number of queued players = ', playerQueue.size, '|| Number of active matches = ', matches.size);
//     }
// }

export function deleteTimeoutedMatches(fastify: FastifyInstance): void {
    for (const match of matches.values()) {
        if (match.shouldDelete() === true)
        {
            match.destroy();
            matches.delete(match.gameId);
        }
    }
}

export function deletePlayerFromQueue(socket: MatchWebSocket)
{
    playerQueue.delete(socket.connectionId);
}

export function closeAllWebSockets(): void {
    for (const match of matches.values()) {
        match.getFirstPlayer().disconnect();
        match.getSecondPlayer().disconnect();
    }
    for (const player of playerQueue.values()){
      player.disconnect();
  }
}

export function clearMatches(): void {
    closeAllWebSockets();
    matches.clear();
}

export function getAllMatches(): number {
    return matches.size;
}

export function getQueuedPlayers() {
    const currentPlayers = Array.from(playerQueue.entries()).map(([playerId, player]) => {
        return { playerId: player.id, username: player.websocket.sessionId };
    });

    return currentPlayers;
}

export function getMatches() {
    const currentMatches = Array.from(matches.entries()).map(([gameId, match]) => {
        return { gameId: match.gameId,
                 PlayerOneUsername: match.getFirstPlayer().websocket.sessionId ,
                 PlayerTwoUsername: match.getSecondPlayer().websocket.sessionId};
    });

    return currentMatches;
}

// Export types for plugin decoration if needed
export type MatchManager = {
    createMatch: typeof createMatch;
    getMatch: typeof getMatch;
    removeMatch: typeof removeMatch;
    closeAllWebSockets: typeof closeAllWebSockets;
    clearMatches: typeof clearMatches;
    broadcastStates: typeof broadcastStates;
    getAllMatches: typeof getAllMatches;
    addToQueue: typeof addToQueue;
    deleteTimeoutedMatches: typeof deleteTimeoutedMatches;
    deletePlayerFromQueue: typeof deletePlayerFromQueue;
    createMatchesFromPlayerQueue: typeof createMatchesFromPlayerQueue;
    // broadcastStateOfMatchmakingService: typeof broadcastStateOfMatchmakingService;
    getQueuedPlayers: typeof getQueuedPlayers;
    getMatches: typeof getMatches;
};