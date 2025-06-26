import {WebSocketHandler} from "../../api/webSocketHandler";
import {WsClientEvent, WsClientLeaveGame, WsClientLeaveMatchmaking} from "../../types/multiplayer-game";

export function sendLeaveMatchmaking(ws: WebSocketHandler) {
    const leaveMsg = {
        event: WsClientEvent.LeaveMatchmaking,
        timestamp: Date.now(),
        data: {}
    } as WsClientLeaveMatchmaking

    ws.sendMessage(JSON.stringify(leaveMsg));
}

export function sendLeaveGame(ws: WebSocketHandler) {
    const leaveMsg = {
        event: WsClientEvent.LeaveGame,
        timestamp: Date.now(),
        data: {}
    } as WsClientLeaveGame

    ws.sendMessage(JSON.stringify(leaveMsg))
}