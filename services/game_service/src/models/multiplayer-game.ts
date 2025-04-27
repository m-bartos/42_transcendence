import {Game} from "../game-base/models/game.js";
import {GameConnectionHandlerInterface, MultiplayerConnectionHandler} from "./game-connection-handler.js";
import {EventEmitter} from "node:events";
import {Player} from "../game-base/models/player.js";
import {GameEndCondition, GameState, GameStatus} from "../game-base/types/game.js";
import {GameEvents} from "../game-base/types/game-events.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GameWebSocket} from "../types/websocket.js";
import {GAME_TIMEOUT} from "../config/game-config.js";
import {ConnectionHandlerEvents} from "../types/connection-handler-events.js";


export class MultiplayerGame extends Game {
    connectionHandler: GameConnectionHandlerInterface;
    gameEventEmitter: EventEmitter;
    publisher: GameEventsPublisher;

    constructor(playerOneUserId: string,
                playerOneSessionId: string,
                playerTwoUserId: string,
                playerTwoSessionId: string,
                gameEventPublisher: GameEventsPublisher,
                eventEmitter: EventEmitter = new EventEmitter(),
                connectionHandler: GameConnectionHandlerInterface = new MultiplayerConnectionHandler(eventEmitter, playerOneSessionId, playerTwoSessionId),
    ) {

        super(new Player(playerOneUserId), new Player(playerTwoUserId), eventEmitter);
        this.gameEventEmitter = eventEmitter;
        this.connectionHandler = connectionHandler;
        this.publisher = gameEventPublisher;

        this.initConnectionHandlerListeners();
        this.initGameListeners();
    }

    protected initGameListeners(): void {
        this.gameEventEmitter.on(GameEvents.GameState, (message: GameState) => {
            try {
                this.connectionHandler.sendMessage(JSON.stringify(message));
            }
            catch (error) {
                console.log("Error: ", error);
            }
        });

        this.gameEventEmitter.on(GameEvents.GameEnded, () => {
            this.sendGameEnded()
        });
    }

    protected initConnectionHandlerListeners() {
        this.gameEventEmitter.on(ConnectionHandlerEvents.PlayerConnected, () => {
            this.tryStartMultiplayerGame()
        });

        this.gameEventEmitter.on(ConnectionHandlerEvents.PlayerDisconnected, () => {
            this.tryPlayerLeftGameEnd()
        });
    }

    getGameEndedState(): any {
        try
        {
            const message = {
                event: 'game.end.multi',
                gameId: this.id,
                timestamp: this.finished,
                gameType: 'multiplayer',
                data: {
                    gameId: this.id,
                    endCondition: this.endCondition,
                    playerOne: {
                        id: this.playerOne.userId,
                        score: this.playerOne.score,
                        paddleBounce: this.playerOnePaddleBounce,
                    },
                    playerTwo: {
                        id: this.playerTwo.userId,
                        score: this.playerTwo.score,
                        paddleBounce: this.playerTwoPaddleBounce,
                    },
                    created: this.created,
                    started: this.started,
                    ended: this.finished,
                    duration: this.gameDuration(),
                    winnerId: this.winnerId
                }
            };
            return message;
        }
        catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    sendGameEnded(): void {
        const message = this.getGameEndedState();
        try {
            this.publisher.sendEvent('game.end.multi', JSON.stringify(message));
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
        this.gameEventEmitter.emit(ConnectionHandlerEvents.ConnectPlayer, playerSessionId, websocket);
    }


    emitDisconnectPlayer(playerSessionId: string): void {
        this.gameEventEmitter.emit(ConnectionHandlerEvents.DisconnectPlayer, playerSessionId);
    }


    tryPlayerLeftGameEnd(): void {
        if (this.getStatus() === GameStatus.Ended) return;

        if (!this.connectionHandler.allPlayersConnected()) {
            this.playerLeftGameEnd();
        }
    }

    playerLeftGameEnd() {
        this.endGame(GameEndCondition.PlayerLeft);

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
            this.setWinnerId(winnerUserId);
        }
        this.gameEventEmitter.emit(GameEvents.GameEnded);
    }

    updateAndBroadcastLiveState(): void {
        if (this.status === GameStatus.Live)
        {
            this.tick();
            this.emitGameState();
        }
    }

    broadcastPendingAndFinished(): void {
        if (this.status === GameStatus.Pending || this.status === GameStatus.Ended)
        {
            this.emitGameState();
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