import {GameWebSocket} from "../types/websocket.js";
import {WsClientEvent, WsClientMessage} from "../types/ws-client-messages.js";
import WebSocket from "ws";
import {MatchmakingEvents} from "../types/matchmaking-events.js";
import {WsGame} from "../types/ws-server-messages.js";
import {WsEvent} from "../types/ws-server-messages.js";
import {matchManager} from "./match-manager.js";
import {matchMakingEmitter} from "./match-making-emitter.js";

export const playerQueue = new Map<number, GameWebSocket>();
export const broadcastStatesInterval = setInterval(() => {
    broadcastStatesToPlayerQueueWebsockets();
}, 1000)
// Handle incoming WebSocket messages
const handleMessageInPlayerQueue = (socket: GameWebSocket) => {
    return (data: Buffer | string) => {
        console.log('Received message for socket:', socket.userId);
        console.log('RawData:', data);

        try {
            // Convert data to string if it's a Buffer
            const messageString = Buffer.isBuffer(data) ? data.toString('utf8') : data;
            const message = JSON.parse(messageString) as WsClientMessage;

            switch (message.event) {
                case WsClientEvent.LeaveMatchmaking:
                    if (!socket.gameId && socket.readyState === WebSocket.OPEN) {
                        handleDisconnectInPlayerQueue(socket);
                    }
                    break;
                default:
                    console.warn(`Unhandled event type: ${message.event}`);
            }
        } catch (error) {
            console.error(`Error processing message for socket ${socket.userId}:`, error);
        }
    };
};
// Handle socket disconnection
const handleDisconnectInPlayerQueue = (socket: GameWebSocket) => {
    console.log(`Socket disconnected: ${socket.userId}`);
    matchManager.deletePlayerFromQueue(socket);
};
// Handle socket errors
const handleErrorInPlayerQueue = (socket: GameWebSocket) => {
    console.error(`Error on socket ${socket.userId}`);
    handleDisconnectInPlayerQueue(socket);
};

// Add socket to matchmaking queue
export function addToQueue(socket: GameWebSocket): void {
    if (!socket.userId) {
        console.error('Cannot add socket to queue: missing userId');
        socket.close();
        return;
    }

    // Bind message handler with socket context
    const messageHandler = handleMessageInPlayerQueue(socket);
    socket.on('message', messageHandler);
    socket.on('close', () => handleDisconnectInPlayerQueue(socket));
    socket.on('error', () => handleErrorInPlayerQueue(socket));

    playerQueue.set(socket.userId, socket);
    socket.enteredQueue = Date.now();

    // Store the message handler for cleanup
    (socket as any)._messageHandler = messageHandler;
    matchMakingEmitter.emit(MatchmakingEvents.PlayerAddedToQueue, socket);
}

// Remove socket from queue and clean up listeners
export function deleteSocketFromPlayerQueue(socket: GameWebSocket): void {
    try {
        const messageHandler = (socket as any)._messageHandler;
        if (messageHandler) {
            socket.removeListener('message', messageHandler);
        }
        socket.removeListener('close', handleDisconnectInPlayerQueue);
        socket.removeListener('error', handleErrorInPlayerQueue);
    } catch (error) {
        console.error(`Failed to remove listeners for socket ${socket.userId}:`, error);
    }
    playerQueue.delete(socket.userId);
}

function getSearchingMatchMessage(): WsGame {
    return {
        event: WsEvent.Searching,
        timestamp: Date.now(),
        data: {},
    };
}

function broadcastStatesToPlayerQueueWebsockets(): void {
    for (const websocket of playerQueue.values()) {
        websocket.send(JSON.stringify(getSearchingMatchMessage()));
    }
}

export function deletePlayerFromQueue(socket: GameWebSocket): void {
    playerQueue.delete(socket.userId);
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
}

export function getQueuedPlayers() {

    const currentPlayers = Array.from(playerQueue.entries()).map(([playerId, player]) => {
        const timeInQueue = ((Date.now() - player.enteredQueue) / 1000).toFixed(1);
        return {
            playerId: player.userId,
            sessionId: player.sessionId,
            username: player.username,
            timeInQueue: timeInQueue
        };
    });

    return currentPlayers;
}

export function destroyPlayerQueue(): void {
    playerQueue.forEach((socket) => {if (socket && socket.readyState === WebSocket.OPEN) {socket.close()}});
    clearInterval(broadcastStatesInterval);
    playerQueue.clear();

}

export function closeAllWebSocketsInPlayerQueue(): void {
    for (const websocket of playerQueue.values()) {
        websocket.close();
    }
}