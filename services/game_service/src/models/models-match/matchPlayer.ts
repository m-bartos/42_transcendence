import { WebSocket } from "ws";

import * as crypto from 'crypto';
import {MatchWebSocket} from "../../types/types-match/websocket.js";

export class MatchPlayer {
    websocket: MatchWebSocket;
    id: string;
    
    constructor(websocket: MatchWebSocket) {
        this.websocket = websocket;
        this.id = crypto.randomUUID();
    }
    
    disconnect(): void {
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.websocket.close();
        }
    }
    
    isConnected(): boolean {
        return this.websocket?.readyState === WebSocket.OPEN;
    }
    
    sendMessage(message: string): void {
        if (this.isConnected()) {
            try {
                this.websocket.send(message);
            } catch (error) {
                console.error(`Failed to send message to player ${this.websocket.connectionId}:`, error);
                this.disconnect();
            }
        }
    }
}