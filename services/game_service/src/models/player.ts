import { WebSocket } from "ws";
import { GameWebSocket } from "../types/websocket.js";

export class Player {
    private websocket: GameWebSocket | null = null;

    constructor(
        readonly sessionId: string
    ) {}

    getPlayerId(): number | null {
        if (this.websocket === null) {
            return null;
        }
        return this.websocket?.playerId;
    }

    connect(websocket: GameWebSocket): void {
        this.websocket = websocket;
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