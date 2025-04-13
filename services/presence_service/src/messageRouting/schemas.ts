// schemas.ts

import { PingPongMessage, SimpleChatMessage } from "./types.js";

export function isPingPongMessage(obj: any): obj is PingPongMessage {
    return (
        obj &&
        obj.protocol === "heartbeat" &&
        obj.action === "keepAlive" &&
        obj.message === "ping"
    );
}

export function isSimpleChatMessage(obj: any): obj is SimpleChatMessage {
    return (
        obj &&
        obj.protocol === "chat" &&
        obj.action === "chat" &&
        Array.isArray(obj.recipients) &&
        typeof obj.message === "string"
    );
}