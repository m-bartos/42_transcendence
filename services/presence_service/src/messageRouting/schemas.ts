// schemas.ts

import { PingPongMessage, SimpleChatMessage, UserStatusMessage } from "./types.js";

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

export function isUserStatusMessage(obj: any): obj is UserStatusMessage {
    return (
        obj &&
            obj.protocol === "userstatus" &&
            obj.action === "status" &&
            Array.isArray(obj.data)
    )
}