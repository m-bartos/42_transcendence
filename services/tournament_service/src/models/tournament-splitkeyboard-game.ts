import {GameInterface, PongGame} from "../pong-game/models/pong-game.js";
import {
    SingleBrowserConnectionHandler
} from "./game-connection-handler.js";
import {EventEmitter} from "node:events";
import {Player} from "../pong-game/models/player.js";
import {
    GameEndCondition,
    GameStatus,
    GameState
} from "../pong-game/types/game.js";
import {GameEvents} from "../pong-game/types/game-events.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {SplitkeyboardWebSocket} from "../types/websocket.js";
import {GAME_TIMEOUT} from "../config/game-config.js";
import {ConnectionHandlerEvents} from "../types/connection-handler-events.js";
import {WsGameMessageCreator} from "../services/ws-game-message-creator.js";
import {WsGame} from "../types/ws-server-messages.js";
import {updateDbAfterGameFinish} from "../utils/tournament-utils.js";

export class TournamentSplitkeyboardGame {
    readonly id: string;
    private connectionHandler: SingleBrowserConnectionHandler;
    private emitter: EventEmitter;
    private publisher: GameEventsPublisher;
    private game: GameInterface;
    private lastTimeBothPlayersConnected: Date;
    private setIntervalTimer: NodeJS.Timeout;

    constructor(gameId: string,
                connectionUserId: number,
                connectionSessionId: string,
                playerOneUserId: number = 1,
                playerOneUsername: string | undefined = undefined,
                playerTwoUserId: number = 2,
                playerTwoUsername: string | undefined = undefined,
                gameEventPublisher: GameEventsPublisher,
                eventEmitter: EventEmitter = new EventEmitter(),
                connectionHandler: SingleBrowserConnectionHandler = new SingleBrowserConnectionHandler(eventEmitter, connectionSessionId, connectionUserId),
    ) {
        this.id = gameId; // TODO: make it TDD
        this.game = new PongGame (new Player(playerOneUserId, playerOneUsername), new Player(playerTwoUserId, playerTwoUsername), eventEmitter);
        this.emitter = eventEmitter;
        this.connectionHandler = connectionHandler;
        this.publisher = gameEventPublisher;

        this.lastTimeBothPlayersConnected = new Date(Date.now());

        this.initConnectionHandlerListeners();
        this.initGameListeners();
        this.setIntervalTimer = setInterval(() => {
            this.updateAndBroadcastLiveState();
        }, 1000 / 60);
    }

    private async updateTournament() {

        const gameState = this.getGameEndedState();
        await updateDbAfterGameFinish(gameState);
    }

    private initGameListeners(): void {
        this.emitter.on(GameEvents.GameState, (message: GameState) => {
            try {
                const wsMsg = this.websocketMessage(message);
                this.connectionHandler.sendMessage(JSON.stringify(wsMsg));
            }
            catch (error) {
                console.log("Error: ", error);
            }
        });

        this.emitter.on(GameEvents.GameEnded, async () => {
            this.lastTimeBothPlayersConnected = new Date(Date.now());
            // this.sendGameEndedEvent();
            this.broadcastGameEnded();
            await this.updateTournament();
            this.connectionHandler.disconnectAll();
        });
    }
    
    private initConnectionHandlerListeners() {
        this.emitter.on(ConnectionHandlerEvents.PlayerConnected, () => {
            this.tryStartSplitkeyboardGame()
        });

        this.emitter.on(ConnectionHandlerEvents.PlayerDisconnected, () => {
            this.tryWsCloseGameEnd()
        });

        this.emitter.on(ConnectionHandlerEvents.PlayerMoveMessage, (username: string, direction: number) => {
            this.movePaddle(username, direction);
        })
    }

    // TODO: implement proper return type
    private getGameEndedState(): any {
        try {
            const game = this.game.getCurrentState();
            const message = {
                event: 'game.end.tournament',
                gameId: this.id,
                timestamp: game.timestamp,
                data: {
                    gameType: 'tournament',
                    gameId: this.id,
                    playerOne: game.players[0],
                    playerTwo: game.players[1],
                    created: game.created,
                    started: game.started,
                    endCondition: game.endCondition,
                    winnerId: game.winnerId,
                    ended: game.ended,
                    duration: game.duration,
                    principalId: this.connectionHandler.getPrincipalId(),
                }
            };
            return message;
        } catch (error) {
            console.error('Failed to construct game ended message: ', error);
            throw error;
        }
    }

    private sendWebsocketGamePropertiesMessage(): void {
        const game = this.game.getCurrentState();
        const msg = WsGameMessageCreator.createGamePropertiesMessage(game);
        this.connectionHandler.sendMessage(JSON.stringify(msg));
    }

    // TODO: change type
    private websocketMessage(state?: GameState | null): WsGame {
        let game: GameState;
        if (state == null) {
            game = this.game.getCurrentState();
        }
        else {
            game = state;
        }

        switch (game.status) {
            case GameStatus.Countdown:
                return WsGameMessageCreator.createGameCountdownMessage(game);
            case GameStatus.Live:
                return WsGameMessageCreator.createGameLiveMessage(game);
            case GameStatus.Ended:
                return WsGameMessageCreator.createGameEndedMessage(game);
            default:
                throw new Error(`Invalid game status: ${game.status}`);
        }
    }

    private sendGameEndedEvent(): void {
        const message = this.getGameEndedState();
        try {
            this.publisher.sendEvent('game.end.tournament', JSON.stringify(message));
            // console.log(`Sent game ended event for game: ${JSON.stringify(message)}`);
        } catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    private tryStartSplitkeyboardGame(): void {
        if (this.connectionHandler.allPlayersConnected()) {
            this.sendWebsocketGamePropertiesMessage();
            this.game.startGame();
        }
    }

    emitConnectPlayer(playerSessionId: string, websocket: SplitkeyboardWebSocket): void {
        this.emitter.emit(ConnectionHandlerEvents.ConnectPlayer, playerSessionId, websocket);
    }

    emitDisconnectPlayer(playerSessionId: string): void {
        this.emitter.emit(ConnectionHandlerEvents.DisconnectPlayer, playerSessionId);
    }

    isSessionInThisActiveGame(sessionId: string): boolean {
        if (this.game.getStatus() === GameStatus.Ended) return false;

        const sessionIds = this.connectionHandler.getAllSessionIds();
        return sessionIds.includes(sessionId);
    }

    private tryWsCloseGameEnd(): void {
        if (this.game.getStatus() === GameStatus.Ended || this.game.getStatus() === GameStatus.Pending) return;

        if (!this.connectionHandler.allPlayersConnected()) {
            this.wsCloseGameEnd();
        }
    }

    private wsCloseGameEnd() {

        const connectedPlayers = this.connectionHandler.connectedPlayers();
        this.game.endGame(GameEndCondition.Error);
    }

    // TODO: Set return type
    // TODO: can be removed? it is just for the testing endpoints
    getBasicState(): any {
        const game = this.game.getCurrentState();
        return {
            gameId: this.id,
            status: game.status,
            playerOneUsername: game.players[0].username,
            playerOneScore: game.players[0].score,
            playerTwoUsername: game.players[1].username,
            playerTwoScore: game.players[1].score,
            created: game.created,
        };
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

    broadcastGameEnded(): void {
        if (this.game.getStatus() === GameStatus.Ended)
        {
            const msg = this.websocketMessage();
            this.connectionHandler.sendMessage(JSON.stringify(msg));
            // this.game.emitGameState();
        }
    }

    movePaddle(username: string, direction: number): void {
        this.game.movePaddleByUsername(username, direction);
    }

    destroy(): void {
        // destroy intervals
        if (this.setIntervalTimer) {
            clearInterval(this.setIntervalTimer);
        }

        // TODO: destroy listeners
        if (this.game) {
            this.game.destroy();
            this.game = null as any;
        }
        if (this.connectionHandler) {
            this.connectionHandler.destroy();
            this.connectionHandler = null as any;
        }
        if (this.publisher) {
            this.publisher = null as any;
        }
        if (this.emitter) {
            this.emitter.removeAllListeners();
            this.emitter = null as any;
        }
        this.lastTimeBothPlayersConnected = null as any;
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