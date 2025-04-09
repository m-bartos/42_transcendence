import {Player} from "./player.js";
import {GameWebSocket} from "../types/websocket.js";

// export class GameConnectionHandler {
//     playerOne: Player;
//     playerTwo: Player;
//
//     constructor (playerOne:Player, playerTwo:Player) {
//         this.playerOne = playerOne;
//         this.playerTwo = playerTwo;
//     }
//
//     connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
//         if (this.playerOne.sessionId === playerSessionId) {
//             this.playerOne.connect(websocket);
//         } else if (this.playerTwo.sessionId === playerSessionId) {
//             this.playerTwo.connect(websocket);
//         } else {
//             throw new Error('Player is not in this game');
//         }
//     }
//
//     disconnectPlayer(playerId: string): boolean {
//         if (this.playerOne.sessionId === playerId) {
//             this.playerOne.disconnect();
//             return true;
//         } else if (this.playerTwo.sessionId === playerId) {
//             this.playerTwo.disconnect();
//             return true;
//         }
//         return false;
//     }
//
//     connectedPlayers(): Map<string, number | null> {
//         const connectedPlayers = new Map<string, number | null>();
//
//         if (this.playerOne.isConnected()) {
//             const playerOneId = this.playerOne.playerId;
//             if (playerOneId !== null) {
//                 connectedPlayers.set('playerOne', playerOneId);
//             }
//         }
//         if (this.playerTwo.isConnected()) {
//             const playerTwoId = this.playerTwo.playerId;
//             if (playerTwoId !== null) {
//                 connectedPlayers.set('playerTwo', playerTwoId);
//             }
//         }
//
//         return connectedPlayers;
//     }
//
//     connectedPlayersCount(): number {
//         let connectedPlayers = 0;
//
//         if (this.playerOne.isConnected()) {
//             connectedPlayers += 1;
//         }
//
//         if (this.playerTwo.isConnected()) {
//             connectedPlayers += 1;
//         }
//
//         return (connectedPlayers);
//     }
//
//     getFirstPlayerUsername(): string {
//         return this.playerOne.getUsername();
//     }
//
//     getSecondPlayerUsername(): string {
//         return this.playerTwo.getUsername();
//     }
// }


export abstract class GameConnectionHandler {
    playerOne: Player;
    playerTwo: Player;
    protected playerOneSessionId: string;
    protected playerTwoSessionId: string;
    protected _connectedPlayers: Map<string, boolean>;
    protected webSockets: Map<string, GameWebSocket | null>; // Stores WebSockets by sessionId

    constructor(playerOneSessionId: string, playerTwoSessionId: string) {
        // TODO: implement playerID
        this.playerOne = new Player(playerOneSessionId, -99);
        this.playerTwo = new Player(playerTwoSessionId, -99);
        this.playerOneSessionId = playerOneSessionId;
        this.playerTwoSessionId = playerTwoSessionId;
        this._connectedPlayers = new Map([
            [playerOneSessionId, false],
            [playerTwoSessionId, false],
        ]);
        this.webSockets = new Map([
            [playerOneSessionId, null],
            [playerTwoSessionId, null],
        ]);
    }

    abstract connectPlayer(playerSessionId: string, websocket: GameWebSocket): void;
    abstract disconnectPlayer(playerId: string): boolean;
    abstract sendMessage(message: string): void;

    connectedPlayersCount(): number {
        let count = 0;
        if (this._connectedPlayers.get(this.playerOneSessionId)) {
            count += 1;
        }
        if (this._connectedPlayers.get(this.playerTwoSessionId)) {
            count += 1;
        }
        return count;
    }

    connectedPlayers(): Map<string, boolean> {
        // Return a new Map with only the players who are connected (true)
        return new Map(
            Array.from(this._connectedPlayers.entries())
                .filter(([_, isConnected]) => isConnected)
        );
    }
}

export class MultiplayerConnectionHandler extends GameConnectionHandler {
    constructor(playerOneSessionId: string, playerTwoSessionId: string) {
        super(playerOneSessionId, playerTwoSessionId);
    }

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this.playerOneSessionId === playerSessionId || this.playerTwoSessionId === playerSessionId) {
            this.webSockets.set(playerSessionId, websocket);
            this._connectedPlayers.set(playerSessionId, true);
        } else {
            throw new Error('Player is not in this game');
        }
    }

    disconnectPlayer(playerId: string): boolean {
        if (this.playerOneSessionId === playerId || this.playerTwoSessionId === playerId) {
            this.webSockets.set(playerId, null);
            this._connectedPlayers.set(playerId, false);
            return true;
        }
        return false;
    }

    sendMessage(message: string): void {
        const playerOneWebSocket = this.webSockets.get(this.playerOneSessionId);
        const playerTwoWebSocket = this.webSockets.get(this.playerTwoSessionId);

        if (playerOneWebSocket) {
            playerOneWebSocket.send(message);
        }
        if (playerTwoWebSocket) {
            playerTwoWebSocket.send(message);
        }
    }
}


export class SingleBrowserConnectionHandler extends GameConnectionHandler {
    constructor(playerOneSessionId: string, playerTwoSessionId: string) {
        super(playerOneSessionId, playerTwoSessionId);
    }

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this.playerOneSessionId !== playerSessionId && this.playerTwoSessionId !== playerSessionId) {
            throw new Error('Player is not in this game');
        }
        // Use the same WebSocket for both players
        this.webSockets.set(this.playerOneSessionId, websocket);
        this.webSockets.set(this.playerTwoSessionId, websocket);
        this._connectedPlayers.set(playerSessionId, true);
    }

    disconnectPlayer(playerId: string): boolean {
        if (this.playerOneSessionId === playerId || this.playerTwoSessionId === playerId) {
            this._connectedPlayers.set(playerId, false);
            // Only clear WebSocket if both players are disconnected
            if (this.connectedPlayersCount() === 0) {
                this.webSockets.set(this.playerOneSessionId, null);
                this.webSockets.set(this.playerTwoSessionId, null);
            }
            return true;
        }
        return false;
    }

    sendMessage(message: string): void {
        // Send through the shared WebSocket (only need to check one, as both point to the same)
        const sharedWebSocket = this.webSockets.get(this.playerOneSessionId);
        if (sharedWebSocket) {
            sharedWebSocket.send(message);
        }
    }
}