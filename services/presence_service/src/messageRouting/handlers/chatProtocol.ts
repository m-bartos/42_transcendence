// handlers/ChatProtocol.ts
import { ProtocolHandler } from "./protocolHandler.js";
import type { MessageObject, SimpleChatMessage } from "../types.js";

export class ChatProtocol extends ProtocolHandler<SimpleChatMessage> {
    protocolName() {
        return "chat";
    }
    handleMessage(message: MessageObject<SimpleChatMessage>) {
        const { receivers, connection } = message;
        if (Array.isArray(receivers)) {
            for (const userId of receivers) {
                // @ts-ignore
                const sockets = this.storage.getUserWebSockets(userId.toString(), "");
                for (const ws of sockets) {
                    if (ws.readyState === ws.OPEN && ws !== connection.ws) {
                        ws.send(JSON.stringify({
                            protocol: "chat",
                            senderId: connection.userId,
                            timestamp: message.timestamp,
                            message: message.payload,
                        }));
                    }
                }
            }
        }
    }
}
