// types.ts
import type { WebSocket } from 'ws'
import type { UserConnection } from "./router.js";
import webSocket from "@fastify/websocket";

export interface BaseMessageSchema {
    protocol: string;
    action: string;
}

export interface PingPongMessage extends BaseMessageSchema {
    protocol: "heartbeat";
    action: "keepAlive";
    message: "ping";
}

export interface SimpleChatMessage extends BaseMessageSchema {
    protocol: "chat";
    action: "chat";
    recipients: string[];
    message: string;
}

export type PayloadType = PingPongMessage | SimpleChatMessage;

export interface MessageObject<T = PayloadType> {
    timestamp: number;
    protocol: string;
    connection: UserConnection;
    receivers: string[] | WebSocket[];
    payload: string;
}

export type HandlerFn<T = PayloadType> = (message: MessageObject<T>) => void;