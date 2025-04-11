import { EventEmitter } from "events";
import { WebSocket } from "ws";
import { MessageObject, PayloadType, HandlerFn } from "./types.js";
import { isPingPongMessage, isSimpleChatMessage } from "./schemas.js";

export class Router extends EventEmitter {
    constructor() {
        super();
    }

    acceptMessage(raw: string, senderWs: WebSocket, userId: string): void {
        let parsed: any;
        try {
            parsed = JSON.parse(raw.toString());
        } catch (e) {
            return; // silently drop
        }

        let protocol = parsed?.protocol;
        let messageObj: MessageObject | null = null;

        if (isPingPongMessage(parsed)) {
            messageObj = {
                timestamp: Date.now(),
                protocol: parsed.protocol,
                sender: senderWs,
                receivers: [senderWs],
                payload: parsed.message,
            };
        } else if (isSimpleChatMessage(parsed)) {
            messageObj = {
                timestamp: Date.now(),
                protocol: parsed.protocol,
                sender: senderWs, // good for checking broadcasting logic to the same user
                receivers: parsed.recipients,
                payload: parsed.message,
            };
        } else {
            return; // silently drop
        }

        this.routeMessage(messageObj);
    }

    routeMessage(message: MessageObject): void {
        console.log("RouteMessage", message);
        this.emit(message.protocol, message);
    }

    register<T extends PayloadType>(protocol: string, handler: HandlerFn<T>): void {
        this.on(protocol, handler);
    }
}