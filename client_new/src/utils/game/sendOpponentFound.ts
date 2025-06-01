import {WsClientAcceptOpponent, WsClientEvent, WsDataOpponentFound, WsGame} from "../../types/multiplayer-game"
import {WebSocketHandler} from "../../api/webSocketHandler";

export function sendOpponentFound(gameDataFromServer:  WebSocketHandler, wsDataOpponentFound: WsDataOpponentFound) {
    const wsMessage = {
        event: WsClientEvent.AcceptOpponent,
        timestamp: Date.now(),
        data:{
            accept: true
        }
    } as WsClientAcceptOpponent

    gameDataFromServer.sendMessage(JSON.stringify(wsMessage));
}
