export enum WsClientEvent {
    GameProperties = 'gameProperties',
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


export interface WsClientDataProperties {
    playerOneUsername: string;
    playerTwoUsername: string;
}

export interface WsClientMessage {
    event: WsClientEvent;
    timestamp: number;
    data: WsDataMovePaddle | WsClientDataAcceptOpponent | WsDataLeaveMatchmaking | WsDataLeaveGame | WsClientDataProperties;
}
