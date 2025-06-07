export const enum ConnectionHandlerEvents {
    // connection handler
    ConnectPlayer = 'ConnectPlayer', // listens
    DisconnectPlayer = 'DisconnectPlayer', // listens
    PlayerConnected = 'PlayerConnected', // emits
    PlayerDisconnected = 'PlayerDisconnected', // emits
    PlayerMoveMessage = 'PlayerMoveMessage', // emits
}