// handlers/HeartbeatProtocol.ts
import { ProtocolHandler } from "./protocolHandler.js";
import type { MessageObject, PingPongMessage } from "../types.js";

export class HeartbeatProtocol extends ProtocolHandler<PingPongMessage> {
    protocolName() {
        return "heartbeat";
    }

    handleMessage(message: MessageObject<PingPongMessage>) {
        const ws = message.connection.ws;

        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                protocol: "heartbeat",
                action: "keepAlive",
                message: "pong",
                timestamp: Date.now()
            }));
        }
    }
}
