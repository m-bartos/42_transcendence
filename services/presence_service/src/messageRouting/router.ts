import { EventEmitter } from "events";
import { WebSocket } from "ws";
import { MessageObject, PayloadType, HandlerFn } from "./types.js";
import {isPingPongMessage, isSimpleChatMessage, isUserStatusMessage} from "./schemas.js";

export interface UserConnection {
    userId: string;
    sessionId: string;
    ws: WebSocket;
}


export class Router extends EventEmitter {
    constructor() {
        super();
    }

    acceptMessage(message: string, userConnection: UserConnection): void {
        let parsedMessage: any;
        try {
            parsedMessage = JSON.parse(message.toString());
        } catch (e) {
            return;
        }
        let messageObj: MessageObject | null = null;

        if (isPingPongMessage(parsedMessage)) {
            messageObj = {
                timestamp: Date.now(),
                protocol: parsedMessage.protocol,
                connection: userConnection,
                receivers: [userConnection.ws],
                payload: parsedMessage,
            };
        } else if (isSimpleChatMessage(parsedMessage)) {
            messageObj = {
                timestamp: Date.now(),
                protocol: parsedMessage.protocol,
                connection: userConnection,
                receivers: parsedMessage.recipients,
                payload: parsedMessage,
            };
        } else if (isUserStatusMessage(parsedMessage)) {
            messageObj = {
                timestamp: Date.now(),
                protocol: parsedMessage.protocol,
                connection: userConnection,
                receivers: [userConnection.ws],
                payload:parsedMessage
            }
        }
        else {
            return;
        }

        this.routeMessage(messageObj);
    }

    routeMessage(message: MessageObject): void {
        this.emit(message.protocol, message);
    }

    register<T extends PayloadType>(protocol: string, handler: HandlerFn<T>): void {
        this.on(protocol, handler);
    }
}