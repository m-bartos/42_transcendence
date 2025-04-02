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

    disconnectPlayer(playerId: string): boolean {
        if (this.playerOne.sessionId === playerId) {
            this.playerOne.disconnect();
            return true;
        } else if (this.playerTwo.sessionId === playerId) {
            this.playerTwo.disconnect();
            return true;
        }
        return false;
    }

    connectedPlayers(): Map<string, number | null> {
        const connectedPlayers = new Map<string, number | null>();

        if (this.playerOne.isConnected()) {
            const playerOneId = this.playerOne.playerId;
            if (playerOneId !== null) {
                connectedPlayers.set('playerOne', playerOneId);
            }
        }
        if (this.playerTwo.isConnected()) {
            const playerTwoId = this.playerTwo.playerId;
            if (playerTwoId !== null) {
                connectedPlayers.set('playerTwo', playerTwoId);
            }
        }

        return connectedPlayers;
    }

    connectedPlayersCount(): number {
        let connectedPlayers = 0;

        if (this.playerOne.isConnected()) {
            connectedPlayers += 1;
        }

        if (this.playerTwo.isConnected()) {
            connectedPlayers += 1;
        }

        return (connectedPlayers);
    }

    getFirstPlayerUsername(): string {
        return this.playerOne.getUsername();
    }

    getSecondPlayerUsername(): string {
        return this.playerTwo.getUsername();
    }
}