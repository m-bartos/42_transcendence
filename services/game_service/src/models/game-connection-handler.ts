import {Player} from "./player.js";
import {GameWebSocket} from "../types/websocket.js";
import {EventEmitter} from "node:events";

// This class emits:
// playerConnected
// playerDisconnected

// This class listens:
// connectPlayer, sessionId
// 

export abstract class GameConnectionHandler {
    protected _connectedPlayers: Map<string, boolean>;
    protected webSockets: Map<string, GameWebSocket | null>; // Stores WebSockets by sessionId
    protected emitter: EventEmitter;

    protected constructor(emitter: EventEmitter,...sessionIds: string[]) {
        if (sessionIds.length < 1 || sessionIds.length > 2) {
            throw new Error('Must provide 1 or 2 session IDs');
        }
        this._connectedPlayers = new Map(sessionIds.map(id => [id, false]));
        this.webSockets = new Map(sessionIds.map(id => [id, null]));
        this.emitter = emitter;
    }

    abstract allPlayersConnected(): boolean;

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this._connectedPlayers.has(playerSessionId)) {
            this.webSockets.set(playerSessionId, websocket);
            this._connectedPlayers.set(playerSessionId, true);
            this.emitter.emit('playerConnected', playerSessionId);
        } else {
            throw new Error('Player is not in this game');
        }
    }

    disconnectPlayer(playerSessionId: string): boolean {
        if (this._connectedPlayers.has(playerSessionId)) {
            const websocket = this.webSockets.get(playerSessionId);
            if (websocket != null && websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
            this.webSockets.set(playerSessionId, null);
            this._connectedPlayers.set(playerSessionId, false);
            this.emitter.emit('playerDisconnected', playerSessionId);
            return true;
        }
        return false;
    }

    disconnectAll(): void {
        for (const [sessionId, websocket] of this.webSockets)
        {
            if (websocket) {
                websocket.close();
                this.webSockets.set(sessionId, null);
            }
        }
        this._connectedPlayers.clear();
    }

    sendMessage(message: string): void {
        for (const [sessionId, websocket] of this.webSockets)
        {
            if (websocket) {
                websocket.send(message);
            }
        }
    }

    noOneConnected(): boolean {
        return this.connectedPlayers().size === 0;
    }

    connectedPlayersCount(): number {
        return this.connectedPlayers().size;
    }

    connectedPlayers(): Map<string, boolean> {
        // Return a new Map with only the players who are connected (true)
        return new Map(
            Array.from(this._connectedPlayers.entries())
                .filter(([_, isConnected]) => isConnected)
        );
    }
}

export class MultiplayerConnectionHandler extends GameConnectionHandler {
    constructor(emitter: EventEmitter, playerOneSessionId: string, playerTwoSessionId: string) {
        super(emitter, playerOneSessionId, playerTwoSessionId);
    }

    allPlayersConnected(): boolean {
        return this.connectedPlayers().size === 2;
    }
}


export class SingleBrowserConnectionHandler extends GameConnectionHandler {
    constructor(emitter: EventEmitter, playerOneSessionId: string) {
        super(emitter, playerOneSessionId);
    }

    allPlayersConnected(): boolean {
        return this.connectedPlayers().size === 1;
    }
}