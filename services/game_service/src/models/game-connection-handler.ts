import {Player} from "./player.js";
import {GameWebSocket} from "../types/websocket.js";

export class GameConnectionHandler {
    playerOne: Player;
    playerTwo: Player;

    constructor (playerOne:Player, playerTwo:Player) {
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
    }

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        if (this.playerOne.sessionId === playerSessionId) {
            this.playerOne.connect(websocket);
        } else if (this.playerTwo.sessionId === playerSessionId) {
            this.playerTwo.connect(websocket);
        } else {
            throw new Error('Player is not in this game');
        }
    }

    disconnectPlayer(playerId: string): void {
        if (this.playerOne.sessionId === playerId) {
            this.playerOne.disconnect();
        } else if (this.playerTwo.sessionId === playerId) {
            this.playerTwo.disconnect();
        }
    }

    bothPlayersConnected (): boolean {
        return (this.playerOne.isConnected() && this.playerTwo.isConnected());
    }

    onlyOnePlayerConnected(): boolean {
        return ((!this.playerOne.isConnected() && this.playerTwo.isConnected()) ||
            (this.playerOne.isConnected() && !this.playerTwo.isConnected()));
    }

    noOneConnected():boolean {
        return (!this.playerOne.isConnected() && !this.playerTwo.isConnected());
    }

    getFirstPlayerUsername(): string {
        return this.playerOne.getUsername();
    }

    getSecondPlayerUsername(): string {
        return this.playerTwo.getUsername();
    }
}