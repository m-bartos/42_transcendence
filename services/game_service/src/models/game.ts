import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus, GameType} from '../types/game.js';
import {GAME_MAX_SCORE, GAME_TIMEOUT, GameConfig,} from '../config/game-config.js';
import {GameWebSocket} from "../types/websocket.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GameConnectionHandler, MultiplayerConnectionHandler} from "./game-connection-handler.js";

import {EventEmitter} from 'node:events';
import {PaddlePosition} from "../types/paddle.js";
import {PhysicsEngine} from "./physics-engine.js";
import {BorderPosition} from "./vertical-border.js";
import {GameEvents} from "../types/game-events.js";

export class Game {
    readonly id: string;
    playerOne: Player;
    playerTwo: Player;
    physics: PhysicsEngine;
    status: GameStatus;
    countdown: number;
    playerOnePaddleBounce: number;
    playerTwoPaddleBounce: number;
    created: Date;
    started: Date | null = null;
    finished: Date | null = null;
    lastTimeBothPlayersConnected: Date;
    winnerId: string | null = null;
    gameType: GameType;
    endCondition: GameEndCondition;
    private publisher: GameEventsPublisher;
    private connectionHandler: GameConnectionHandler;
    gameEventEmitter: EventEmitter;

    constructor({
                    gameType = GameType.Multiplayer,
                    playerOneSessionId,
                    playerTwoSessionId,
                    gameEventPublisher,
                    gameEventEmitter = new EventEmitter(),
                    physicsEngine = new PhysicsEngine(gameEventEmitter),
                    connectionHandler = new MultiplayerConnectionHandler(gameEventEmitter, playerOneSessionId, playerTwoSessionId),
                }: GameConfig)
    {
		this.id = crypto.randomUUID();
        this.gameEventEmitter = gameEventEmitter;
        // TODO: implement playerId
        this.playerOne = new Player(playerOneSessionId, "-99");
        this.playerTwo = new Player(playerTwoSessionId, "-99");
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

        this.gameEventEmitter.on(GameEvents.GameEnded, () => {this.sendGameEnded()});
        this.gameEventEmitter.on(GameEvents.GameStarted, () => {this.sendGameStarted()});
        this.gameEventEmitter.on(GameEvents.ScoreAdded, () => {this.tryScoreLimitGameEnd()});

        this.initPhysicsListeners();
        this.initConnectionHandlerListeners();
    }

    private initConnectionHandlerListeners() {
        this.gameEventEmitter.on(GameEvents.PlayerConnected, () => {this.tryStartGame()});
        this.gameEventEmitter.on(GameEvents.PlayerDisconnected, () => {this.tryPlayerLeftGameEnd()});
    }

    private initPhysicsListeners(): void {
        this.gameEventEmitter.addListener(GameEvents.PaddleBounce, (position: PaddlePosition) => {
            if (position === PaddlePosition.Right)
            {
                this.playerOnePaddleBounce++;
            }
            else if (position === PaddlePosition.Left)
            {
                this.playerTwoPaddleBounce++;
            }
        })

        this.gameEventEmitter.addListener(GameEvents.Score, (position: BorderPosition) => {
            if (position === BorderPosition.Right)
            {
                this.playerOne.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
            }
            else if (position === BorderPosition.Left)
            {
                this.playerTwo.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
            }
        })
    }

    private currentState(): GameState {
       const baseState = {
            gameType: this.gameType,
            status: this.status,
            timestamp: Date.now(),
            playerOne: {
                username: this.playerOne.playerId,
                paddle: this.physics.serializePaddleOne(),
                score: this.playerOne.score
            },
            playerTwo: {
                username: this.playerOne.playerId,
                paddle: this.physics.serializePaddleTwo(),
                score: this.playerTwo.score
            },
            ball: this.physics.serializeBall(),
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

    private gameDuration(): number | null {
        if (!this.started || !this.finished)
            return null;

        const durationMs = this.finished.getTime() - this.started.getTime();

        if (durationMs < 0) {
            return 0;
        }

        return durationMs / 1000;
    }

    private sendGameStarted(): void {
        try {
            // Construct the message
            const message = {
                event: 'game.start',
                gameId: this.id,
                timestamp: this.started,
                data: {}
            };

            // Convert to JSON string and publish
            this.publisher.sendEvent('game.start',JSON.stringify(message));
            console.log(`Sent game started event for gameId: ${this.id}`);
        } catch (error) {
            console.error('Failed to send game started event:', error);
            throw error;
        }
    }

    private sendGameEnded(): void{
        try
        {
            const message = {
                event: 'game.end',
                gameId: this.id,
                timestamp: this.finished,
                data: {
                    gameId: this.id,
                    gameType: this.gameType,
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
        }
        catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    private tryScoreLimitGameEnd(): void {
        if (this.status === GameStatus.Live && this.isMaxScoreReached())
        {
            this.setWinnerId();
            this.endGame(GameEndCondition.ScoreLimit);
            this.gameEventEmitter.emit(GameEvents.GameEnded);
        }
    }

    private tryPlayerLeftGameEnd(): void {
        if (this.status === GameStatus.Ended) return;

        if (!this.connectionHandler.allPlayersConnected()) {
            this.playerLeftGameEnd();
            this.gameEventEmitter.emit(GameEvents.GameEnded);
        }
    }

    tick(): void {
        if (this.status === GameStatus.Live)
        {
            this.physics.update();
        }
    }

    private isMaxScoreReached() : boolean
    {
        return this.playerOne.score === GAME_MAX_SCORE || this.playerTwo.score === GAME_MAX_SCORE;
    }

    private setWinnerId()
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

    private tryStartGame(): void {
        if (this.connectionHandler.allPlayersConnected() && this.status === GameStatus.Pending) {
            this.startCountdown(GameStatus.Live);
            if (this.started === null)
            {
                this.started = new Date(Date.now());
            }
            this.gameEventEmitter.emit(GameEvents.GameStarted);
        }
    }

    private endGame(endCondition: GameEndCondition): void
    {
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        
        this.status = GameStatus.Ended;
        this.endCondition = endCondition;

        this.physics.stopAndReset();
        if (this.finished === null)
        {
            this.finished = new Date(Date.now());
        }
    }

    broadcastGameState(): void {
        const message = JSON.stringify(this.currentState());
        this.connectionHandler.sendMessage(message);
    }

    // TODO: startCountdown could be rewritten somehow
    private startCountdown(nextStatus: GameStatus) {
        this.status = GameStatus.Countdown;

        let count = 3;
        this.countdown = count;
        this.broadcastGameState();
        count--;

        const countdownInterval = setInterval(() => {
            if (this.status === GameStatus.Countdown)
            {
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

    private playerLeftGameEnd() {
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

    emitDisconnectPlayer(playerSessionId: string): void {
        this.gameEventEmitter.emit(GameEvents.DisconnectPlayer, playerSessionId);
    }

    // disconnectPlayer(playerSessionId: string): void {
    //     if (this.connectionHandler.disconnectPlayer(playerSessionId))
    //     {
    //         this.gameEventEmitter.emit('playerDisconnected', this);
    //     }
    // }

    shouldDelete(): boolean
    {
        if (this.status === GameStatus.Ended && this.connectionHandler.noOneConnected())
        {
            return true;
        }

        if (this.status === GameStatus.Pending || this.status === GameStatus.Ended)
        {
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
        // clean eventEmitter listeners
    }

    movePaddle(sessionId: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        if (this.playerOne.sessionId === sessionId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
        } else if (this.playerTwo.sessionId === sessionId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
        }
    }

}