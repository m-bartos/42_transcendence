import { WebSocket } from "ws";
import { GameWebSocket } from "../types/websocket.js";

export class Player {
    private websocket: GameWebSocket | null = null;
    private _playerId: number;
    private _playerSessionId: string;

    constructor( playerSessionId: string, playerId: number
    ) {
        this._playerId = playerId;
        this._playerSessionId = playerSessionId;
    }

    get playerId(): number {
        return this._playerId;
    }

    get sessionId(): string {
        return this._playerSessionId;
    }

    connect(websocket: GameWebSocket): void {
        this.websocket = websocket;
        this._playerId = websocket.playerId;
        this._playerSessionId = websocket.playerSessionId;
    }

    getUsername(): string {
        if (this.websocket === null)
        {
            return "";
        }
        return this.websocket.username;
    }

    disconnect(): void {
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.websocket.close();
        }
        this.websocket = null;
    }
    
    isConnected(): boolean {
        return this.websocket?.readyState === WebSocket.OPEN;
    }
    
    sendMessage(message: string): void {
        if (this.isConnected()) {
            try {
                this.websocket!.send(message);
            } catch (error) {
                console.error(`Failed to send message to player ${this.websocket?.playerId} from game ${this.websocket?.gameId}:`, error);
                this.disconnect();
            }
        }
    }
}