import { WebSocket } from "ws";
import { GameWebSocket } from "../types/websocket.js";

export class Player {
    private websocket: GameWebSocket | null = null;
    private _playerId: number | null = null;

    constructor(
        readonly sessionId: string
    ) {}

    get playerId(): number | null {
        return this._playerId;
    }

    set playerId(playerId: number) {
        this._playerId = playerId;
    }

    connect(websocket: GameWebSocket): void {
        this.websocket = websocket;
        this._playerId = websocket.playerId;
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