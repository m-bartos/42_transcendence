import {GameWebSocket} from "../types/websocket.js";
import {EventEmitter} from "node:events";
import {ConnectionHandlerEvents} from "../types/connection-handler-events.js";

// This class emits:
// playerConnected
// playerDisconnected

// This class listens:
// connectPlayer -  sessionId, websocket
// disconnectPlayer - sessionId

export interface GameConnectionHandlerInterface {
    allPlayersConnected(): boolean;
    connectedPlayers(): Map<string, boolean>;
    disconnectAll(): void;
    getUserId(sesionId: string): string;
    noOneConnected(): boolean;
    sendMessage(message: string): void;
}

export abstract class GameConnectionHandler implements GameConnectionHandlerInterface {
    protected _connectedPlayers: Map<string, boolean>;
    protected webSockets: Map<string, GameWebSocket | null>; // Stores WebSockets by sessionId
    protected emitter: EventEmitter;

    protected constructor(emitter: EventEmitter,...sessionIds: string[]) {
        if (sessionIds.length < 1 || sessionIds.length > 2) {
            throw new Error('Must provide 1 or 2 session IDs');
        }
        this._connectedPlayers = new Map(sessionIds.map(id => [id, false]));
        this.webSockets = new Map(sessionIds.map(id => [id, null]));
        this.emitter = emitter;

        this.initListeners();
    }

    abstract allPlayersConnected(): boolean;

    private initListeners(): void {
        this.emitter.addListener(ConnectionHandlerEvents.ConnectPlayer, (playerSessionId: string, websocket: GameWebSocket) => {
            this.connectPlayer(playerSessionId, websocket);
        });

        this.emitter.addListener(ConnectionHandlerEvents.DisconnectPlayer, (playerSessionId: string) => {
            this.disconnectPlayer(playerSessionId);
        });
    }

    private connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this._connectedPlayers.has(playerSessionId)) {
            this.webSockets.set(playerSessionId, websocket);
            this._connectedPlayers.set(playerSessionId, true);
            this.emitter.emit(ConnectionHandlerEvents.PlayerConnected, playerSessionId);
        } else {
            throw new Error('Player is not in this game');
        }
    }

    private disconnectPlayer(playerSessionId: string): boolean {
        if (this._connectedPlayers.has(playerSessionId)) {

            this._connectedPlayers.set(playerSessionId, false);
            const websocket = this.webSockets.get(playerSessionId);
            this.webSockets.set(playerSessionId, null);

            try {
                if (websocket != null) {
                    if (websocket.readyState === WebSocket.OPEN)
                    {
                        websocket.close();
                    }
                }
            }
            catch(error)
            {
                console.error(error);
            }
            finally {
                this.emitter.emit(ConnectionHandlerEvents.PlayerDisconnected, playerSessionId);
            }

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

    connectedPlayers(): Map<string, boolean> {
        // Return a new Map with only the players who are connected (true)
        return new Map(
            Array.from(this._connectedPlayers.entries())
                .filter(([_, isConnected]) => isConnected)
        );
    }

    getUserId(sessionId: string): string {
        const websocket = this.webSockets.get(sessionId);
        if (!websocket)
        {
            throw new Error("No userId found for this sessionIs");
        }

        return websocket.userId;
    }
}

export class MultiplayerConnectionHandler extends GameConnectionHandler {
    constructor(emitter: EventEmitter, playerOneSessionId: string, playerTwoSessionId: string) {
        super(emitter, playerOneSessionId, playerTwoSessionId);
    }

    allPlayersConnected(): boolean {
        return this.connectedPlayers().size === 2;
    }
}


// export class SingleBrowserConnectionHandler extends GameConnectionHandler {
//     constructor(emitter: EventEmitter, playerOneSessionId: string) {
//         super(emitter, playerOneSessionId);
//     }
//
//     allPlayersConnected(): boolean {
//         return this.connectedPlayers().size === 1;
//     }
// }