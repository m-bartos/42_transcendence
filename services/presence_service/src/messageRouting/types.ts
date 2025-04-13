// types.ts
import type { WebSocket } from 'ws'
import type { UserConnection } from "./router.js";

export interface BaseMessageSchema {
    protocol: string;
    action: string;
}

export interface PingPongMessage extends BaseMessageSchema {
    protocol: "heartbeat";
    action: "keepAlive";
    message: string;
}

export interface SimpleChatMessage extends BaseMessageSchema {
    protocol: "chat";
    action: "chat";
    recipients: string[];
    message: string;
}

export interface UserStatusMessage extends BaseMessageSchema {
    protocol: "userstatus";
    action: "status";
    data: string[];
}

export type PayloadType = PingPongMessage | SimpleChatMessage | UserStatusMessage;

export interface MessageObject<T = PayloadType> {
    timestamp: number;
    protocol: string;
    connection: UserConnection;
    receivers: string[] | WebSocket[];
    payload: T;
}

export type HandlerFn<T = PayloadType> = (message: MessageObject<T>) => void;