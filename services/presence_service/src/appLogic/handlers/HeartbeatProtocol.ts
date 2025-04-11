// handlers/HeartbeatProtocol.ts
import { ProtocolHandler } from "./ProtocolHandler.js";
import type { MessageObject, PingPongMessage } from "../types.js";

export class HeartbeatProtocol extends ProtocolHandler<PingPongMessage> {
    protocolName() {
        return "heartbeat";
    }

    handleMessage(message: MessageObject<PingPongMessage>) {
        const ws = message.sender;

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
