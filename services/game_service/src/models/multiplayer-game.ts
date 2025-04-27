import {Game} from "./game.js";
import {GameConnectionHandler, MultiplayerConnectionHandler} from "./game-connection-handler.js";
import {EventEmitter} from "node:events";
import {Player} from "./player.js";
import {GameEndCondition, GameState, GameStatus, GameType} from "../types/game.js";
import {GameEvents} from "../types/game-events.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GameWebSocket} from "../types/websocket.js";
import {GAME_TIMEOUT} from "../config/game-config.js";


export class MultiplayerGame extends Game {

    // game: Game;
    connectionHandler: GameConnectionHandler;
    gameEventEmitter: EventEmitter;
    publisher: GameEventsPublisher;

    constructor(playerOneUserId: string,
                playerOneSessionId: string,
                playerTwoUserId: string,
                playerTwoSessionId: string,
                gameEventPublisher: GameEventsPublisher,
                eventEmitter: EventEmitter = new EventEmitter(),
                connectionHandler: GameConnectionHandler = new MultiplayerConnectionHandler(eventEmitter, playerOneSessionId, playerTwoSessionId),
    ) {
        super(GameType.Multiplayer, new Player(playerOneUserId), new Player(playerTwoUserId), eventEmitter);
        this.gameEventEmitter = eventEmitter;
        this.connectionHandler = connectionHandler;
        // this.game = game;

        this.publisher = gameEventPublisher;



        this.initConnectionHandlerListeners();
        this.initGameListeners();
    }

    protected initGameListeners(): void {
        this.gameEventEmitter.on(GameEvents.Update, (message: GameState) => {
            this.connectionHandler.sendMessage(JSON.stringify(message)); // TODO: try catch on stringify
        });

        this.gameEventEmitter.on(GameEvents.GameEnded, () => {
            this.sendGameEnded()
        });
    }

    protected initConnectionHandlerListeners() {
        this.gameEventEmitter.on(GameEvents.PlayerConnected, () => {
            this.tryStartMultiplayerGame()
        });

        this.gameEventEmitter.on(GameEvents.PlayerDisconnected, () => {
            this.tryPlayerLeftGameEnd()
        });
    }

    sendGameEnded(): void {
        const message = this.gameEndedState();
        // TODO: add information from this object to the message
        try {
            this.publisher.sendEvent('game.end', JSON.stringify(message));
            console.log(`Sent game ended event for game: ${JSON.stringify(message)}`);
        } catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    protected tryStartMultiplayerGame(): void {
        if (this.connectionHandler.allPlayersConnected()) {
            super.startGame();
        }
    }

    emitConnectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        this.gameEventEmitter.emit(GameEvents.ConnectPlayer, playerSessionId, websocket);
    }


    emitDisconnectPlayer(playerSessionId: string): void {
        this.gameEventEmitter.emit(GameEvents.DisconnectPlayer, playerSessionId);
    }


    tryPlayerLeftGameEnd(): void {
        if (this.getStatus() === GameStatus.Ended) return;

        if (!this.connectionHandler.allPlayersConnected()) {
            this.playerLeftGameEnd();
            this.gameEventEmitter.emit(GameEvents.GameEnded);
        }
    }

    playerLeftGameEnd() {
        this.endGame(GameEndCondition.PlayerLeft);

        const connectedPlayers = this.connectionHandler.connectedPlayers();
        if (connectedPlayers.size != 1)
        {
            throw new Error();
        }

        const winnerPlayerSessionId = connectedPlayers.keys().next().value;

        if (winnerPlayerSessionId !== null && winnerPlayerSessionId !== undefined)
        {
            // TODO: implement userId
            this.setWinnerId(winnerPlayerSessionId);
        }
    }

    updateAndBroadcastLiveState(): void {
        if (this.status === GameStatus.Live)
        {
            this.tick();
            this.broadcastGameState();
        }
    }

    broadcastPendingAndFinished(): void {
        if (this.status === GameStatus.Pending || this.status === GameStatus.Ended)
        {
            this.broadcastGameState();
        }
    }

    // TODO: Change the constant GAME_TIMEOUT to TDD
    shouldDelete(): boolean {
        if (this.status === GameStatus.Ended && this.connectionHandler.noOneConnected()) {
            return true;
        }

        if (this.status === GameStatus.Pending || this.status === GameStatus.Ended) {
            const currentTime = new Date();
            const timeSinceLastConnected = currentTime.getTime() - this.lastTimeBothPlayersConnected.getTime();
            if (timeSinceLastConnected > GAME_TIMEOUT * 1000) {
                return true;
            }
        }

        return false;
    }

}