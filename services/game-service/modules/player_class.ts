import { GameWebSocket } from '../types/game.js'
import { WebSocket } from "ws";

export class Player {
    private websocket: GameWebSocket | null = null;
    
    constructor(
        readonly id: string
    ) {}
    
    connect(websocket: GameWebSocket): void {
        this.websocket = websocket;
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
                console.error(`Failed to send message to player ${this.id}:`, error);
                this.disconnect();
            }
        }
    }
}