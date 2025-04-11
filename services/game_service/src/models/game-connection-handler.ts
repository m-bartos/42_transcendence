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
    protected _connectedPlayers: Map<string, boolean>;
    protected webSockets: Map<string, GameWebSocket | null>; // Stores WebSockets by sessionId

    protected constructor(...sessionIds: string[]) {
        if (sessionIds.length < 1 || sessionIds.length > 2) {
            throw new Error('Must provide 1 or 2 session IDs');
        }
        this._connectedPlayers = new Map(sessionIds.map(id => [id, false]));
        this.webSockets = new Map(sessionIds.map(id => [id, null]));
    }

    abstract allPlayersConnected(): boolean;

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this._connectedPlayers.has(playerSessionId)) {
            this.webSockets.set(playerSessionId, websocket);
            this._connectedPlayers.set(playerSessionId, true);
        } else {
            throw new Error('Player is not in this game');
        }
        // console.log(this.webSockets, this._connectedPlayers);
    }

    disconnectPlayer(playerSessionId: string): boolean {
        if (this._connectedPlayers.has(playerSessionId)) {
            const websocket = this.webSockets.get(playerSessionId);
            if (websocket != null && websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
            this.webSockets.set(playerSessionId, null);
            this._connectedPlayers.set(playerSessionId, false);
            return true;
        }
        return false;
    }

    disconnectAll(): void {
        for (const [sessionId, websocket] of this.webSockets)
        {
            if (websocket) {
                websocket.close();
                this.webSockets.set(sessionId, null);
            }
        }
        this._connectedPlayers.clear();
    }

    sendMessage(message: string): void {
        for (const [sessionId, websocket] of this.webSockets)
        {
            if (websocket) {
                websocket.send(message);
            }
        }
    }

    noOneConnected(): boolean {
        return this.connectedPlayers().size === 0;
    }

    connectedPlayersCount(): number {
        return this.connectedPlayers().size;
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

    allPlayersConnected(): boolean {
        return this.connectedPlayers().size === 2;
    }
}


export class SingleBrowserConnectionHandler extends GameConnectionHandler {
    constructor(playerOneSessionId: string) {
        super(playerOneSessionId);
    }

    allPlayersConnected(): boolean {
        return this.connectedPlayers().size === 1;
    }
}