import {GameInterface, PongGame} from "../game-base/models/pongGame.js";
import {GameConnectionHandlerInterface, MultiplayerConnectionHandler} from "./game-connection-handler.js";
import {EventEmitter} from "node:events";
import {Player} from "../game-base/models/player.js";
import {GameEndCondition, GameState, GameStatus, WsGameState} from "../game-base/types/game.js";
import {GameEvents} from "../game-base/types/game-events.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GameWebSocket} from "../types/websocket.js";
import {GAME_TIMEOUT} from "../config/game-config.js";
import {ConnectionHandlerEvents} from "../types/connection-handler-events.js";


export class MultiplayerGame {
    readonly id: string;
    private connectionHandler: GameConnectionHandlerInterface;
    private gameEventEmitter: EventEmitter;
    private publisher: GameEventsPublisher;
    private game: GameInterface;
    private lastTimeBothPlayersConnected: Date;

    constructor(playerOneUserId: string,
                playerOneSessionId: string,
                playerTwoUserId: string,
                playerTwoSessionId: string,
                gameEventPublisher: GameEventsPublisher,
                eventEmitter: EventEmitter = new EventEmitter(),
                connectionHandler: GameConnectionHandlerInterface = new MultiplayerConnectionHandler(eventEmitter, playerOneSessionId, playerTwoSessionId),
    ) {
        this.id = crypto.randomUUID(); // TODO: make it TDD
        this.game = new PongGame (new Player(playerOneUserId), new Player(playerTwoUserId), eventEmitter);
        this.gameEventEmitter = eventEmitter;
        this.connectionHandler = connectionHandler;
        this.publisher = gameEventPublisher;

        this.lastTimeBothPlayersConnected = new Date(Date.now());

        this.initConnectionHandlerListeners();
        this.initGameListeners();
    }

    private initGameListeners(): void {
        this.gameEventEmitter.on(GameEvents.GameState, (message: GameState) => {
            try {
                const wsMsg = this.websocketMessage(message);
                this.connectionHandler.sendMessage(JSON.stringify(wsMsg));
            }
            catch (error) {
                console.log("Error: ", error);
            }
        });

        this.gameEventEmitter.on(GameEvents.GameEnded, () => {
            this.lastTimeBothPlayersConnected = new Date(Date.now());
            this.sendGameEnded()
        });
    }

    private initConnectionHandlerListeners() {
        this.gameEventEmitter.on(ConnectionHandlerEvents.PlayerConnected, () => {
            this.tryStartMultiplayerGame()
        });

        this.gameEventEmitter.on(ConnectionHandlerEvents.PlayerDisconnected, () => {
            this.tryPlayerLeftGameEnd()
        });
    }

    // TODO: implement proper return type
    private getGameEndedState(): any {
        try
        {
            const game = this.game.getCurrentState();
            const message = {
                event: 'game.end.multi',
                gameId: this.id,
                timestamp: game.timestamp,
                data: {
                    gameType: 'multiplayer',
                    gameId: this.id,
                    playerOne: game.players[0],
                    playerTwo: game.players[1],
                    created: game.created,
                    started: game.started,
                    endCondition: game.endCondition,
                    winnerId: game.winnerId,
                    ended: game.ended,
                    duration: game.duration,
                }
            };
            return message;
        }
        catch (error) {
            console.error('Failed to construct game ended message: ', error);
            throw error;
        }
    }

    // TODO: change type
    private websocketMessage(state?: GameState | null): WsGameState {

        let game: GameState;
        if (state == null) {
            game = this.game.getCurrentState();
        }
        else
        {
            game = state;
        }

        const msg: WsGameState = {
            gameId: this.id,
            status: game.status,
            timestamp: Date.now(),
            paddles: game.paddles,
            ball: game.ball,
            players: game.players,
        };

        if (game.status === GameStatus.Countdown) {
            msg.countdown = game.countdown;
        }

        if (game.status === GameStatus.Ended) {
            msg.winnerId = game.winnerId;
        }

        return msg;
    }


    private sendGameEnded(): void {
        const message = this.getGameEndedState();
        try {
            this.publisher.sendEvent('game.end.multi', JSON.stringify(message));
            console.log(`Sent game ended event for game: ${JSON.stringify(message)}`);
        } catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    private tryStartMultiplayerGame(): void {
        if (this.connectionHandler.allPlayersConnected()) {
            this.game.startGame();
        }
    }

    emitConnectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        this.gameEventEmitter.emit(ConnectionHandlerEvents.ConnectPlayer, playerSessionId, websocket);
    }


    emitDisconnectPlayer(playerSessionId: string): void {
        this.gameEventEmitter.emit(ConnectionHandlerEvents.DisconnectPlayer, playerSessionId);
    }


    private tryPlayerLeftGameEnd(): void {
        if (this.game.getStatus() === GameStatus.Ended || this.game.getStatus() === GameStatus.Pending) return;

        if (!this.connectionHandler.allPlayersConnected()) {
            this.playerLeftGameEnd();
        }
    }

    private playerLeftGameEnd() {

        const connectedPlayers = this.connectionHandler.connectedPlayers();
        if (connectedPlayers.size != 1)
        {
            throw new Error("No one connected.");
        }

        const winnerSessionId = connectedPlayers.keys().next().value;

        if (!winnerSessionId)
        {
            throw new Error("Players left before the end of the game.");
        }

        const winnerUserId = this.connectionHandler.getUserId(winnerSessionId);

        if (winnerUserId !== null && winnerUserId !== undefined)
        {
            this.game.setWinnerId(winnerUserId);
        }

        this.game.endGame(GameEndCondition.PlayerLeft);
    }

    updateAndBroadcastLiveState(): void {
        if (this.game.getStatus() === GameStatus.Live)
        {
            this.game.tick();
            const msg = this.websocketMessage();
            this.connectionHandler.sendMessage(JSON.stringify(msg));
            // this.game.emitGameState();
        }
    }

    broadcastPendingAndFinished(): void {
        if (this.game.getStatus() === GameStatus.Pending || this.game.getStatus() === GameStatus.Ended)
        {
            const msg = this.websocketMessage();
            this.connectionHandler.sendMessage(JSON.stringify(msg));
            // this.game.emitGameState();
        }
    }

    movePaddle(userId: string, direction: number): void {
        this.game.movePaddle(userId, direction);
    }

    destroy(): void {
        this.game.destroy();
        // this.connectionHandler.destroy(); TODO: implement destroy on connectionHandler?
    }

    // TODO: Change the constant GAME_TIMEOUT to TDD
    shouldDelete(): boolean {
        if (this.game.getStatus() === GameStatus.Ended && this.connectionHandler.noOneConnected()) {
            return true;
        }

        if (this.game.getStatus() === GameStatus.Pending || this.game.getStatus() === GameStatus.Ended) {
            const currentTime = new Date();
            const timeSinceLastConnected = currentTime.getTime() - this.lastTimeBothPlayersConnected.getTime();
            if (timeSinceLastConnected > GAME_TIMEOUT * 1000) {
                return true;
            }
        }

        return false;
    }

}