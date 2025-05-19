export enum WsClientEvent {
    AcceptOpponent = 'acceptOpponent',
    MovePaddle = 'movePaddle',
    LeaveMatchmaking = 'leaveMatchmaking',
    LeaveGame = 'leaveGame',
}

export interface WsClientDataAcceptOpponent {
    accept: boolean
}

export interface WsClientAcceptOpponent {
    event: WsClientEvent.AcceptOpponent;
    timestamp: number;
    data: WsClientDataAcceptOpponent;
}

export interface WsDataMovePaddle {
    direction: number;
}

export interface WsClientMessage {
    event: WsClientEvent;
    timestamp: number;
    data: WsDataMovePaddle | WsClientDataAcceptOpponent;
}