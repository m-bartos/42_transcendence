export enum WsClientEvent {
    AcceptOpponent = 'acceptOpponent',
    MovePaddle = 'movePaddle',
    LeaveMatchmaking = 'leaveMatchmaking',
    LeaveGame = 'leaveGame',
}

export interface WsClientDataAcceptOpponent {
    accept: boolean
}

export interface WsDataMovePaddle {
    direction: number;
}

export interface WsDataLeaveMatchmaking {}

export interface WsDataLeaveGame {}

export interface WsClientMessage {
    event: WsClientEvent;
    timestamp: number;
    data: WsDataMovePaddle | WsClientDataAcceptOpponent | WsDataLeaveMatchmaking | WsDataLeaveGame;
}