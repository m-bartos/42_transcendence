import {WsClientReady, WsClientStatus, WsDataOpponentFound, WsGame} from "../../types/game"
import {WebSocketHandler} from "../../api/webSocketHandler";

export function sendOpponentFound(gameDataFromServer:  WebSocketHandler, wsDataOpponentFound: WsDataOpponentFound) {
    const wsMessage = {
        status: WsClientStatus.OpponentFound,
        timestamp: Date.now(),
        data:{
            self: {
                userId: wsDataOpponentFound.self.userId,
                username: wsDataOpponentFound.self.username,
                avatar: wsDataOpponentFound.self.avatar,
                ready: true
            },
            opponent: {
                userId: wsDataOpponentFound.opponent.userId,
                username: wsDataOpponentFound.opponent.username,
                avatar: wsDataOpponentFound.opponent.avatar,
                ready: wsDataOpponentFound.opponent.ready
            }
        }
    } as WsClientReady

    gameDataFromServer.sendMessage(JSON.stringify(wsMessage));
}
