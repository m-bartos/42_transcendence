import {GameWebSocket} from "../types/websocket.js";
import {GameStatus, WsClientReady, WsClientStatus, WsDataOpponentFound, WsGame} from "../pong-game/types/game.js";
import {EventEmitter} from "node:events";
import WebSocket from 'ws';


export class PendingMatch {
    id: string;
    websocketOne: GameWebSocket;
    websocketTwo: GameWebSocket;

    emitter: EventEmitter;

    created: Date;
    timeout: number;

    private broadcastInterval: NodeJS.Timeout;
    private timeoutInterval: NodeJS.Timeout;

    private listeners: Map<GameWebSocket, { message: (raw: Buffer) => void; close: () => void }>;

    constructor(emitter: EventEmitter, websocketOne: GameWebSocket, websocketTwo: GameWebSocket) {
        this.id = crypto.randomUUID();
        this.websocketOne = websocketOne;
        this.websocketTwo = websocketTwo;

        this.emitter = emitter;

        this.created = new Date();
        this.timeout = 60 * 1000;

        // Initialize listener storage
        this.listeners = new Map();

        // Register event handlers for both WebSockets
        [this.websocketOne, this.websocketTwo].forEach((ws) => {
            // Create and store the message listener
            const messageListener = (raw: Buffer) => this.handleMessage(ws, raw);
            const closeListener = this.handleClose.bind(this);

            ws.on("message", messageListener);
            ws.on("close", closeListener);

            // Store the listeners
            this.listeners.set(ws, { message: messageListener, close: closeListener });
        });

        this.broadcastInterval = setInterval(this.broadcastState.bind(this), 1000);
        this.timeoutInterval = setInterval(this.checkTimeout.bind(this), 5000);
    }

    private checkTimeout(): void {
        if (Date.now() - this.created.getTime() > this.timeout) {
            this.emitter.emit('pendingMatchTimeout', this.id);
        }
    }

    private checkPendingMatchReady(): void {
        if (this.websocketOne.ready && this.websocketTwo.ready) {
            this.emitter.emit('pendingMatchReady', this.id);
        }
    }

    private handleMessage(ws: GameWebSocket, raw: Buffer): void {
        try
        {
            const message = JSON.parse(raw.toString());
            if (message.status === WsClientStatus.LeaveMatchmaking)
            {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    //send player left message
                    ws.close(1000, 'User left matchmaking');
                }
            }

            if (message.status === GameStatus.OpponentFound) {
                // `ws` is the WebSocket that triggered the event
                ws.ready = message.data.self.ready;
                if (!message.data.self.ready) {
                    this.emitter.emit("pendingMatchRefused", this.id);
                } else {
                    this.checkPendingMatchReady();
                }
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

    private handleClose(): void {
        this.emitter.emit("pendingMatchRefused", this.id);
    }

    private makeOpponentFoundMessage(self: GameWebSocket, opponent: GameWebSocket): WsGame {
        return {
            status: GameStatus.OpponentFound,
            timestamp: Date.now(),
            data: {
                self: {
                    user_id: self.userId,
                    username: self.username,
                    avatar: self.avatarLink,
                    ready: self.ready
                },
                opponent: {
                    user_id: opponent.userId,
                    username: opponent.username,
                    avatar: opponent.avatarLink,
                    ready: opponent.ready
                }
            } as WsDataOpponentFound,
        };
    }

    destroy(): void {
        // Clear intervals
        clearInterval(this.broadcastInterval);
        clearInterval(this.timeoutInterval);

        // Remove WebSocket event listeners
        [this.websocketOne, this.websocketTwo].forEach((ws) => {
            const listeners = this.listeners.get(ws);
            if (listeners) {
                ws.removeListener("message", listeners.message);
                ws.removeListener("close", listeners.close);
            }
            this.listeners.delete(ws);
        });

        // Nullify references
        this.emitter = null as any;
        this.websocketOne = null as any;
        this.websocketTwo = null as any;
    }

    broadcastState(): void {
        [this.websocketOne, this.websocketTwo].forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                const opponent = ws === this.websocketOne ? this.websocketTwo : this.websocketOne;
                ws.send(JSON.stringify(this.makeOpponentFoundMessage(ws, opponent)));
            }
        });
    }
}