import {GameWebSocket} from "../types/websocket.js";
import {EventEmitter} from "node:events";
import {ConnectionHandlerEvents} from "../types/connection-handler-events.js";
import WebSocket from 'ws';
import {WsClientEvent} from "../types/ws-client-messages.js";

// This class emits:
// playerConnected
// playerDisconnected

// This class listens:
// connectPlayer -  sessionId, websocket
// disconnectPlayer - sessionId

export interface GameConnectionHandlerInterface {
    allPlayersConnected(): boolean;
    connectedPlayers(): Map<string, boolean>;
    disconnectAll(): void;
    getUserId(sesionId: string): number;
    getAllUserIds(): number[];
    noOneConnected(): boolean;
    sendMessage(message: string): void;
    destroy(): void;
}

export abstract class GameConnectionHandler implements GameConnectionHandlerInterface {
    protected _connectedPlayers: Map<string, boolean>;
    protected webSockets: Map<string, GameWebSocket | null>; // Stores WebSockets by sessionId
    protected emitter: EventEmitter;

    protected wsListeners: Map<GameWebSocket, { message: (raw: Buffer) => void; close: () => void }>;

    private emitterListeners: {
        connectPlayer: (playerSessionId: string, websocket: GameWebSocket) => void;
        disconnectPlayer: (playerSessionId: string) => void;
    };

    protected constructor(emitter: EventEmitter,...sessionIds: string[]) {
        if (sessionIds.length < 1 || sessionIds.length > 2) {
            throw new Error('Must provide 1 or 2 session IDs');
        }
        this._connectedPlayers = new Map(sessionIds.map(id => [id, false]));
        this.webSockets = new Map(sessionIds.map(id => [id, null]));
        this.emitter = emitter;

        this.wsListeners = new Map();

        this.emitterListeners = {
            connectPlayer: (playerSessionId: string, websocket: GameWebSocket) => {
                this.connectPlayer(playerSessionId, websocket);
            },
            disconnectPlayer: (playerSessionId: string) => {
                this.disconnectPlayer(playerSessionId);
            }
        };

        this.initListeners();
    }

    abstract allPlayersConnected(): boolean;

    private initWsListeners(ws: GameWebSocket): void {
        if (this.wsListeners.has(ws)) return;

        const messageListener = (raw: Buffer) => this.handleMessage(ws, raw);
        const closeListener = () => this.handleClose(ws);

        try
        {
            ws.on("message", messageListener);
            ws.on("close", closeListener);
            this.wsListeners.set(ws, { message: messageListener, close: closeListener });
        }
        catch (error) {
            console.error(`Failed to initialize listeners for WebSocket: ${error}`);
        }
    }

    private handleClose(ws: GameWebSocket): void {
        this.disconnectPlayer(ws.sessionId);
    }

    private handleMessage(ws: GameWebSocket, raw: Buffer): void {
        try
        {
            const message = JSON.parse(raw.toString());
            if (message.event === WsClientEvent.LeaveGame)
            {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    this._connectedPlayers.delete(ws.sessionId);
                    this.emitter.emit(ConnectionHandlerEvents.PlayerDisconnected, ws.sessionId);
                }
            }
            else if (message.event === WsClientEvent.MovePaddle)
            {
                this.emitter.emit(ConnectionHandlerEvents.PlayerMoveMessage, ws.userId, message.data.direction);
            }
        }
        catch (error)
        {
            if (ws && ws.readyState === WebSocket.OPEN) {
                // send invalid message error to client
            }
            console.error(error);
        }

    }

    private initListeners(): void {
        this.emitter.addListener(ConnectionHandlerEvents.ConnectPlayer, this.emitterListeners.connectPlayer);
        this.emitter.addListener(ConnectionHandlerEvents.DisconnectPlayer, this.emitterListeners.disconnectPlayer);
    }

    private destroyListeners(): void {
        try {
            this.emitter.removeListener(ConnectionHandlerEvents.ConnectPlayer, this.emitterListeners.connectPlayer);
            this.emitter.removeListener(ConnectionHandlerEvents.DisconnectPlayer, this.emitterListeners.disconnectPlayer);
        } catch (error) {
            console.error(`Failed to remove emitter listeners for GameConnectionHandler: ${error}`);
        }
    }

    private connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this._connectedPlayers.has(playerSessionId)) {
            this.webSockets.set(playerSessionId, websocket);
            this._connectedPlayers.set(playerSessionId, true);
            this.initWsListeners(websocket);
            this.emitter.emit(ConnectionHandlerEvents.PlayerConnected, playerSessionId);
        } else {
            throw new Error('Player is not in this game');
        }
    }

    private destroyWsListeners(ws: GameWebSocket): void {        // Remove WebSocket event listeners
        const listeners = this.wsListeners.get(ws);
        if (listeners && ws.readyState !== WebSocket.CLOSED) {
            try{
                ws.removeListener("message", listeners.message);
                ws.removeListener("close", listeners.close);
            } catch (error) {
                console.error(`Failed to remove listeners for WebSocket: ${error}`);
            }
        }
        this.wsListeners.delete(ws);
    }

    private disconnectPlayer(playerSessionId: string): boolean {
        if (this._connectedPlayers.has(playerSessionId)) {

            this._connectedPlayers.set(playerSessionId, false);
            const websocket = this.webSockets.get(playerSessionId);
            this.webSockets.set(playerSessionId, null);
            if (websocket) {
                this.destroyWsListeners(websocket as GameWebSocket);
            }
            try {
                if (websocket != null) {
                    if (websocket.readyState === WebSocket.OPEN)
                    {
                        websocket.close();
                    }
                }
            }
            catch(error)
            {
                console.error(error);
            }
            finally {
                this.emitter.emit(ConnectionHandlerEvents.PlayerDisconnected, playerSessionId);
            }

            return true;
        }
        return false;
    }

    disconnectAll(): void {
        this.webSockets.forEach((ws) => { if (ws) {this.disconnectPlayer(ws?.sessionId)}})
    }

    sendMessage(message: string): void {
        for (const [sessionId, websocket] of this.webSockets)
        {
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                websocket.send(message);
            }
        }
    }

    noOneConnected(): boolean {
        return this.connectedPlayers().size === 0;
    }

    connectedPlayers(): Map<string, boolean> {
        // Return a new Map with only the players who are connected (true)
        return new Map(
            Array.from(this._connectedPlayers.entries())
                .filter(([_, isConnected]) => isConnected)
        );
    }

    getUserId(sessionId: string): number {
        const websocket = this.webSockets.get(sessionId);
        if (!websocket)
        {
            throw new Error("No userId found for this sessionIs");
        }

        return websocket.userId;
    }

    getAllUserIds(): number[] {
        const userIds: number[] = [];
        for (const [sessionId, websocket] of this.webSockets)
        {
            if (websocket) {
                userIds.push(websocket.userId);
            }
        }
        return userIds;
    }

    destroy(): void {
        this._connectedPlayers.clear();
        this.disconnectAll();
        this.webSockets.clear();
        this.destroyListeners();
        this.emitter = null as any;
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


// export class SingleBrowserConnectionHandler extends GameConnectionHandler {
//     constructor(emitter: EventEmitter, playerOneSessionId: string) {
//         super(emitter, playerOneSessionId);
//     }
//
//     allPlayersConnected(): boolean {
//         return this.connectedPlayers().size === 1;
//     }
// }