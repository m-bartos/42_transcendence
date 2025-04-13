// handlers/HeartbeatProtocol.ts
import { AbstractProtocol } from "./abstractProtocol.js";
import type { MessageObject, PingPongMessage } from "../types.js";

export class HeartbeatProtocol extends AbstractProtocol<PingPongMessage> {
    protocolName() {
        return "heartbeat";
    }

    handleMessage(message: MessageObject<PingPongMessage>) {
        const ws = message.connection.ws;

        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                protocol: message.protocol,
                action: message.payload.action,
                timestamp: Date.now(),
                message: "pong",
            }));
        }
    }
}
