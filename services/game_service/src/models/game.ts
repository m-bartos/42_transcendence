import {MultiplayerPlayer, Player, SplitKeyboardPlayer} from './player.js';
import {
    GameEndCondition,
    GameState,
    GameStatus,
    GameType,
    MultiplayerGameState,
    SplitkeybordGameState
} from '../types/game.js';
import {GAME_MAX_SCORE, GAME_TIMEOUT, GameConfig,} from '../config/game-config.js';
import {GameWebSocket} from "../types/websocket.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GameConnectionHandler, MultiplayerConnectionHandler} from "./game-connection-handler.js";

import {EventEmitter} from 'node:events';
import {PaddlePosition} from "../types/paddle.js";
import {PhysicsEngine} from "./physics-engine.js";
import {BorderPosition} from "./vertical-border.js";
import {GameEvents} from "../types/game-events.js";

export abstract class Game {
    readonly id: string;
    playerOne: SplitKeyboardPlayer | MultiplayerPlayer;
    playerTwo: SplitKeyboardPlayer | MultiplayerPlayer;
    physics: PhysicsEngine;
    status: GameStatus;
    countdown: number;
    playerOnePaddleBounce: number;
    playerTwoPaddleBounce: number;
    created: Date;
    started: Date | null = null;
    finished: Date | null = null;
    lastTimeBothPlayersConnected: Date;
    // winnerId: string | null = null;
    gameType: GameType;
    endCondition: GameEndCondition;
    protected publisher: GameEventsPublisher;
    protected connectionHandler: GameConnectionHandler;
    gameEventEmitter: EventEmitter;

    protected constructor(gameType = GameType.Multiplayer,
                          playerOne: SplitKeyboardPlayer | MultiplayerPlayer,
                          playerTwo: SplitKeyboardPlayer | MultiplayerPlayer,
                          gameEventPublisher: GameEventsPublisher,
                          gameEventEmitter: EventEmitter,
                          physicsEngine: PhysicsEngine,
                          connectionHandler: GameConnectionHandler,
                          gameConfig?: GameConfig) {
        this.id = crypto.randomUUID();
        this.gameEventEmitter = gameEventEmitter;
        // TODO: implement playerId
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.playerOnePaddleBounce = 0;
        this.playerTwoPaddleBounce = 0;

        this.physics = physicsEngine;

        this.connectionHandler = connectionHandler;

        this.gameType = gameType;
        this.status = GameStatus.Pending;

        this.endCondition = GameEndCondition.Unknown;
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        this.countdown = 0;

        this.publisher = gameEventPublisher;

        this.gameEventEmitter.on(GameEvents.GameEnded, () => {
            this.sendGameEnded()
        });
        this.gameEventEmitter.on(GameEvents.GameStarted, () => {
            this.sendGameStarted()
        });
        this.gameEventEmitter.on(GameEvents.ScoreAdded, () => {
            this.tryScoreLimitGameEnd()
        });

        this.initPhysicsListeners();
        this.initConnectionHandlerListeners();
    }

    abstract sendGameEnded(): void;
    abstract movePaddle(playerId: string, direction: number): void;
    abstract setWinner(): void;

    protected initConnectionHandlerListeners() {
        this.gameEventEmitter.on(GameEvents.PlayerConnected, () => {
            this.tryStartGame()
        });
    }

    protected initPhysicsListeners(): void {
        this.gameEventEmitter.addListener(GameEvents.PaddleBounce, (position: PaddlePosition) => {
            if (position === PaddlePosition.Right) {
                this.playerOnePaddleBounce++;
            } else if (position === PaddlePosition.Left) {
                this.playerTwoPaddleBounce++;
            }
        })

        this.gameEventEmitter.addListener(GameEvents.Score, (position: BorderPosition) => {
            if (position === BorderPosition.Right) {
                this.playerOne.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
            } else if (position === BorderPosition.Left) {
                this.playerTwo.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
            }
        })
    }

    currentStatistics() {
        const baseStats = {
            gameId: this.id,
            status: this.status,
            playerOneUsername: this.playerOne.getUsername(),
            playerTwoUsername: this.playerTwo.getUsername(),
            playerOneScore: this.playerOne.score,
            playerTwoScore: this.playerTwo.score,
            created: this.created
        };

        return baseStats;
    }

    protected gameDuration(): number | null {
        if (!this.started || !this.finished)
            return null;

        const durationMs = this.finished.getTime() - this.started.getTime();

        if (durationMs < 0) {
            return 0;
        }

        return durationMs / 1000;
    }

    protected sendGameStarted(): void {
        try {
            // Construct the message
            const message = {
                event: 'game.start',
                gameId: this.id,
                timestamp: this.started,
                data: {}
            };

            // Convert to JSON string and publish
            this.publisher.sendEvent('game.start', JSON.stringify(message));
            console.log(`Sent game started event for gameId: ${this.id}`);
        } catch (error) {
            console.error('Failed to send game started event:', error);
            throw error;
        }
    }

    protected tryScoreLimitGameEnd(): void {
        if (this.status === GameStatus.Live && this.isMaxScoreReached()) {
            this.setWinner();
            this.endGame(GameEndCondition.ScoreLimit);
            this.gameEventEmitter.emit(GameEvents.GameEnded);
        }
    }

    tick(): void {
        if (this.status === GameStatus.Live) {
            this.physics.update();
        }
    }

    protected isMaxScoreReached(): boolean {
        return this.playerOne.score === GAME_MAX_SCORE || this.playerTwo.score === GAME_MAX_SCORE;
    }

    protected tryStartGame(): void {
        if (this.connectionHandler.allPlayersConnected() && this.status === GameStatus.Pending) {
            this.startCountdown(GameStatus.Live);
            if (this.started === null) {
                this.started = new Date(Date.now());
            }
            this.gameEventEmitter.emit(GameEvents.GameStarted);
        }
    }

    protected endGame(endCondition: GameEndCondition): void {
        this.lastTimeBothPlayersConnected = new Date(Date.now());

        this.status = GameStatus.Ended;
        this.endCondition = endCondition;

        this.physics.stopAndReset();
        if (this.finished === null) {
            this.finished = new Date(Date.now());
        }
    }

    broadcastGameState(): void {
        const message = JSON.stringify(this.currentState());
        this.connectionHandler.sendMessage(message);
    }

    // TODO: startCountdown could be rewritten somehow
    protected startCountdown(nextStatus: GameStatus) {
        this.status = GameStatus.Countdown;

        let count = 3;
        this.countdown = count;
        this.broadcastGameState();
        count--;

        const countdownInterval = setInterval(() => {
            if (this.status === GameStatus.Countdown) {
                this.countdown = count; // Add countdown value to state
                this.broadcastGameState();

                count--;
                if (count < 0) {
                    clearInterval(countdownInterval);
                    this.status = nextStatus;
                    this.countdown = 0;
                    this.broadcastGameState();
                }
            }
        }, 1000);
    }

    emitConnectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        this.gameEventEmitter.emit(GameEvents.ConnectPlayer, playerSessionId, websocket);
    }


    emitDisconnectPlayer(playerSessionId: string): void {
        this.gameEventEmitter.emit(GameEvents.DisconnectPlayer, playerSessionId);
    }

    // disconnectPlayer(playerSessionId: string): void {
    //     if (this.connectionHandler.disconnectPlayer(playerSessionId))
    //     {
    //         this.gameEventEmitter.emit('playerDisconnected', this);
    //     }
    // }

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

    destroy(): void {
        this.physics = null as any;
        this.connectionHandler.disconnectAll();
        this.lastTimeBothPlayersConnected = null as any;
        this.gameEventEmitter.removeAllListeners();
    }


    currentState(): GameState {
        const baseState = {
            gameType: this.gameType,
            status: this.status,
            timestamp: Date.now(),
            paddles: [
                this.physics.serializePaddleOne(),
                this.physics.serializePaddleTwo()
            ],
            ball: this.physics.serializeBall(),
            players: [
                this.playerOne.serialize(),
                this.playerTwo.serialize()
            ]
        };

        if (this.status === GameStatus.Countdown) {
            return {
                ...baseState,
                countdown: this.countdown,
            }
        }

        return baseState;
    }
}



export class SplitKeyboardGame extends Game {
    winnerUsername;

    constructor (    gameType = GameType.Multiplayer,
                     playerOne: SplitKeyboardPlayer,
                     playerTwo: SplitKeyboardPlayer,
                     gameEventPublisher: GameEventsPublisher,
                     gameEventEmitter: EventEmitter,
                     physicsEngine: PhysicsEngine,
                     connectionHandler: GameConnectionHandler,
                     gameConfig?: GameConfig)
    {
        super(gameType, playerOne, playerTwo, gameEventPublisher, gameEventEmitter, physicsEngine, connectionHandler, gameConfig);
        this.winnerUsername = '';
    }

    movePaddle(username: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        console.log(username);
        console.log(this.playerOne.getUsername());
        console.log(this.playerTwo.getUsername());

        if (this.playerOne.getUsername() === username) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
        } else if (this.playerTwo.getUsername() === username) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
        }
    }

    sendGameEnded(): void{
        try
        {
            const gamePrincipal = this.connectionHandler.connectedPlayers().keys().next();

            const message = {
                event: 'game.end',
                gameId: this.id,
                timestamp: this.finished,
                gameType: this.gameType,
                gamePrincipalId: 'principalId',// where to get this info?
                data: {
                    gameId: this.id,
                    endCondition: this.endCondition,
                    playerOne: {
                        username: this.playerOne.getUsername(),
                        score: this.playerOne.score,
                        paddleBounce: this.playerOnePaddleBounce,
                    },
                    playerTwo: {
                        username: this.playerTwo.getUsername(),
                        score: this.playerTwo.score,
                        paddleBounce: this.playerTwoPaddleBounce,
                    },
                    created: this.created,
                    started: this.started,
                    ended: this.finished,
                    duration: this.gameDuration(),
                    winnerUsername: this.winnerUsername,
                    // looserId: game.looserId
                }
            };
            this.publisher.sendEvent('game.end', JSON.stringify(message));
            console.log(`Sent game ended event for gameId: ${this.id}`);
        }
        catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    setWinner(): void {
        if (this.playerOne.score === GAME_MAX_SCORE)
        {
            this.winnerUsername = this.playerOne.getUsername();
        }
        else if (this.playerTwo.score === GAME_MAX_SCORE)
        {
            this.winnerUsername = this.playerTwo.getUsername();
        }
    }

    currentState(): SplitkeybordGameState {
        const baseState = super.currentState();
        if (this.status === GameStatus.Ended && this.winnerUsername != null)
        {
            return {
                ...baseState,
                winnerUsername: this.winnerUsername,
            }
        }
        else
        {
            return baseState;
        }
    }
};

export class MultiplayerGame extends Game {
    winnerId: string;

    constructor (    gameType = GameType.Multiplayer,
                     playerOne: MultiplayerPlayer,
                     playerTwo: MultiplayerPlayer,
                     gameEventPublisher: GameEventsPublisher,
                     gameEventEmitter: EventEmitter,
                     physicsEngine: PhysicsEngine,
                     connectionHandler: GameConnectionHandler,
                     gameConfig?: GameConfig) {
        super(gameType, playerOne, playerTwo, gameEventPublisher, gameEventEmitter, physicsEngine, connectionHandler, gameConfig);
        this.winnerId = '';
    }

    initConnectionHandlerListeners(): void {
        super.initConnectionHandlerListeners();
        this.gameEventEmitter.on(GameEvents.PlayerDisconnected, () => {this.tryPlayerLeftGameEnd()});
    }

    sendGameEnded(): void{
        if (this.playerOne instanceof MultiplayerPlayer && this.playerTwo instanceof MultiplayerPlayer) {
            try {
                const message = {
                    event: 'game.end',
                    gameId: this.id,
                    timestamp: this.finished,
                    gameType: this.gameType,
                    data: {
                        gameId: this.id,
                        endCondition: this.endCondition,
                        playerOne: {
                            id: this.playerOne.playerId,
                            score: this.playerOne.score,
                            paddleBounce: this.playerOnePaddleBounce,
                        },
                        playerTwo: {
                            id: this.playerTwo.playerId,
                            score: this.playerTwo.score,
                            paddleBounce: this.playerTwoPaddleBounce,
                        },
                        created: this.created,
                        started: this.started,
                        ended: this.finished,
                        duration: this.gameDuration(),
                        winnerId: this.winnerId,
                        // looserId: game.looserId
                    }
                };
                this.publisher.sendEvent('game.end', JSON.stringify(message));
                console.log(`Sent game ended event for gameId: ${this.id}`);
            } catch (error) {
                console.error('Failed to send game ended event:', error);
                throw error;
            }

        }
    }

    tryPlayerLeftGameEnd(): void {
        if (this.status === GameStatus.Ended) return;

        if (!this.connectionHandler.allPlayersConnected()) {
            this.playerLeftGameEnd();
            this.gameEventEmitter.emit(GameEvents.GameEnded);
        }
    }

    setWinner(): void
    {
        if (this.playerOne instanceof MultiplayerPlayer && this.playerTwo instanceof MultiplayerPlayer)
        {
            if (this.playerOne.score === GAME_MAX_SCORE)
            {
                this.winnerId = this.playerOne.playerId;
            }
            else if (this.playerTwo.score === GAME_MAX_SCORE)
            {
                this.winnerId = this.playerTwo.playerId;
            }
        }
    }

    currentState(): MultiplayerGameState {
        const baseState = {
            gameType: this.gameType,
            status: this.status,
            timestamp: Date.now(),
            paddles: [
                this.physics.serializePaddleOne(),
                this.physics.serializePaddleTwo()
            ],
            ball: this.physics.serializeBall(),
            players: [
                this.playerOne.serialize(),
                this.playerTwo.serialize()
            ]
        };

        if (this.status === GameStatus.Countdown)
        {
            return {
                ...baseState,
                countdown: this.countdown,
            }
        }
        else if (this.status === GameStatus.Ended && this.winnerId != null)
        {
            return {
                ...baseState,
                winnerId: this.winnerId,
            }
        }
        else
        {
            return baseState;
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
            // TODO: implement playerId
            this.winnerId = winnerPlayerSessionId;
            // this.winnerId = "-99";
        }
    }

    movePaddle(username: string, direction: number) {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        if (this.playerOne instanceof MultiplayerPlayer && this.playerTwo instanceof MultiplayerPlayer) {
            if (this.playerOne.playerId === username) {
                this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
            } else if (this.playerTwo.playerId === username) {
                this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
            }
        }
    }

}