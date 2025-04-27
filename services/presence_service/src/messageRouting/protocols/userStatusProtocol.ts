import {AbstractProtocol} from "./abstractProtocol.js";
import type { MessageObject, UserStatusMessage } from "../types.js";
import storage from "../connectionStorage.js";
export class UserStatusProtocol extends AbstractProtocol {

    protocolName(): string {
        return "userstatus";
    }

    handleMessage(message: MessageObject<UserStatusMessage>) {
        const { payload } = message;
        const ws = message.connection.ws;
        const userIds: string[] = payload.data;
        const data: { [key: string]: string } = {};
        for (const userId of userIds) {
            data[userId] = storage.getUserStatus(userId.toString()) ? "online" : "offline";
        }
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                    protocolName: message.protocol,
                    action: message.payload.action,
                    timestamp: Date.now(),
                    data: data,
                }));
        }
    }
}