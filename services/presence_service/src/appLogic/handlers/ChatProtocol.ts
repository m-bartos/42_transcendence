// handlers/ChatProtocol.ts
import { ProtocolHandler } from "./ProtocolHandler.js";
import type { MessageObject, SimpleChatMessage } from "../types.js";

export class ChatProtocol extends ProtocolHandler<SimpleChatMessage> {
    protocolName() {
        return "chat";
    }
    handleMessage(message: MessageObject<SimpleChatMessage>) {
        const { receivers } = message;
        console.log("I am called from HandleMessage in ChatProtocol");
        if (Array.isArray(receivers)) {
            console.log("Receivers: ", receivers);
            for (const userId of receivers) {
                console.log("HM:",typeof userId);
                console.log("HM:",typeof userId.toString());
                console.log("HM:",userId.toString());
                // @ts-ignore
                const sockets = this.storage.getUserWebSockets(userId.toString(), "");
                console.log(`Sockets`, sockets.length);
                for (const ws of sockets) {
                    if (ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify({
                            from: "chat",
                            message: message.payload,
                            sender: "olda", // you might extract userId/session from sender later
                            timestamp: message.timestamp,
                        }));
                    }
                }
            }
        }
    }
}
