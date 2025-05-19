import {GameWebSocket} from "../types/websocket.js";
import {
    GameStatus
} from "../pong-game/types/game.js";
import {EventEmitter} from "node:events";
import WebSocket from 'ws';
import {WsClientDataAcceptOpponent, WsClientEvent} from "../types/ws-client-messages.js";
import {WsDataOpponentFound, WsGame} from "../types/ws-server-messages.js";


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
        this.id = crypto.randomUUID(); // TODO: TDD
        this.websocketOne = websocketOne;
        this.websocketTwo = websocketTwo;

        this.emitter = emitter;

        this.created = new Date();
        this.timeout = 60 * 1000; // TODO: TDD

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
        try {
            const message = JSON.parse(raw.toString());
            if (message.event === WsClientEvent.LeaveMatchmaking) // TODO: Duplicate with ws-handler?? check
            {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    //send player left message
                    ws.close(1000, 'User left matchmaking');
                }
            }

            if (message.event === WsClientEvent.AcceptOpponent) {
                // `ws` is the WebSocket that triggered the event
                const data = message.data as WsClientDataAcceptOpponent;
                ws.ready = data.accept;
                if (!data.accept) {
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

    private makeOpponentFoundMessage(self: GameWebSocket): WsGame {
        let playerOneRole = '';
        let playerTwoRole ='';
        if (self === this.websocketOne)
        {
            playerOneRole = 'self'
            playerTwoRole = 'opponent'

        }
        else if (self === this.websocketTwo)
        {
            playerOneRole = 'opponent'
            playerTwoRole = 'self'

        }

        return {
            event: GameStatus.OpponentFound,
            timestamp: Date.now(),
            data: {
                players: [
                {
                    id: this.websocketOne.userId,
                    username: this.websocketOne.username,
                    avatar: this.websocketOne.avatarLink,
                    ready: this.websocketOne.ready,
                    role: playerOneRole,
                },
                {
                    id: this.websocketTwo.userId,
                    username: this.websocketTwo.username,
                    avatar: this.websocketTwo.avatarLink,
                    ready: this.websocketTwo.ready,
                    role: playerTwoRole
                }
                ]
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
                const self = ws === this.websocketOne ? this.websocketOne : this.websocketTwo;
                ws.send(JSON.stringify(this.makeOpponentFoundMessage(self)));
            }
        });
    }
}