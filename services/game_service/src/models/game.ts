import {Ball} from './ball.js';
import {Paddle} from './paddle.js';
import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus, GameType} from '../types/game.js';
import {GAME_MAX_SCORE, GAME_TIMEOUT,} from '../types/game-constants.js';
import {GameWebSocket} from "../types/websocket.js";
import {PaddlePosition} from "../types/paddle.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GamePhysicsEngine} from "./game-physics-engine.js";
import {GameConnectionHandler} from "./game-connection-handler.js";

import {EventEmitter} from 'node:events';

export interface GameOptions {
    gameType?: GameType,
    playerOneSessionId: string,
    playerTwoSessionId: string,
    gameEventPublisher: GameEventsPublisher,
    ball?: Ball,
    paddleOne?: Paddle,
    paddleTwo?: Paddle,
    connectionHandler?: GameConnectionHandler,
    gameEventEmitter?: EventEmitter,
}


export class Game {
    readonly id: string;
    physics: GamePhysicsEngine;
    status: GameStatus;
    countdown: number;
    playerOneScore: number;
    playerTwoScore: number;
    playerOnePaddleBounce: number;
    playerTwoPaddleBounce: number;
    created: Date;
    started: Date | null = null;
    finished: Date | null = null;
    lastTimeBothPlayersConnected: Date;
    winnerId: number | null = null;
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
                    ball = new Ball(),
                    paddleOne = new Paddle(PaddlePosition.Left),
                    paddleTwo = new Paddle(PaddlePosition.Right),
                    connectionHandler = new GameConnectionHandler(new Player(playerOneSessionId), new Player(playerTwoSessionId)),
                    gameEventEmitter = new EventEmitter(),
                }: GameOptions)
    {
		this.id = crypto.randomUUID();
        this.gameType = gameType;
        this.endCondition = GameEndCondition.Unknown;
        this.status = GameStatus.Pending;
        this.physics = new GamePhysicsEngine(ball, paddleOne, paddleTwo);
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.countdown = 0;
        this.playerOnePaddleBounce = 0;
        this.playerTwoPaddleBounce = 0;
        this.publisher = gameEventPublisher;
        this.connectionHandler = connectionHandler;
        this.gameEventEmitter = gameEventEmitter;
        this.gameEventEmitter.on('gameEnded', this.sendGameFinished);
        this.gameEventEmitter.on('playerConnected', this.tryStartGame);
        this.gameEventEmitter.on('gameStarted', this.sendGameStarted);
    }

    currentState(): GameState {
        const baseState = {
            status: this.status,
            timestamp: Date.now(),
            playerOne: {
                username: this.connectionHandler.getFirstPlayerUsername(),
                paddle: this.physics.paddleOne.serialize(),
                score: this.playerOneScore
            },
            playerTwo: {
                username: this.connectionHandler.getSecondPlayerUsername(),
                paddle: this.physics.paddleTwo.serialize(),
                score: this.playerTwoScore
            },
            ball: this.physics.ball.serialize(),
        };

        if (this.status === GameStatus.Countdown)
        {
            return {
                ...baseState,
                countdown: this.countdown,
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
            playerOneUsername: this.connectionHandler.getFirstPlayerUsername(),
            playerTwoUsername: this.connectionHandler.getSecondPlayerUsername(),
            playerOneScore: this.playerOneScore,
            playerTwoScore: this.playerTwoScore,
            created: this.created
        };

        return baseStats;
    }


    gameDuration(): number | null {
        if (!this.started || !this.finished)
            return null;

        const durationMs = this.finished.getTime() - this.started.getTime();

        if (durationMs < 0) {
            return 0;
        }

        return durationMs / 1000;
    }

    sendGameStarted(game: Game): void {
        try {
            // Construct the message
            const message = {
                event: 'game.start',
                gameId: game.id,
                timestamp: game.started,
                data: {}
            };

            // Convert to JSON string and publish
            this.publisher.sendEvent('game.start',JSON.stringify(message));
            console.log(`Sent game started event for gameId: ${game.id}`);
        } catch (error) {
            console.error('Failed to send game started event:', error);
            throw error;
        }
    }

    // rename to sendGameEnded
    sendGameFinished(game: Game): void{
        try
        {
            const message = {
                event: 'game.end',
                gameId: game.id,
                timestamp: game.finished,
                data: {
                    gameId: game.id,
                    gameType: game.gameType,
                    endCondition: game.endCondition,
                    playerOne: {
                        id: game.connectionHandler.playerOne.playerId,
                        score: game.playerOneScore,
                        paddleBounce: game.playerOnePaddleBounce,
                    },
                    playerTwo: {
                        id: game.connectionHandler.playerTwo.playerId,
                        score: game.playerTwoScore,
                        paddleBounce: game.playerTwoPaddleBounce,
                    },
                    created: game.created,
                    started: game.started,
                    ended: game.finished,
                    duration: game.gameDuration(),
                    winnerId: game.winnerId,
                    // looserId: game.looserId
                }
            };
            game.publisher.sendEvent('game.end', JSON.stringify(message));
            console.log(`Sent game ended event for gameId: ${game.id}`);
        }
        catch (error) {
            console.error('Failed to send game ended event:', error);
            throw error;
        }
    }

    tick(): void {
        if (this.status === GameStatus.Live)
        {
            const paddleBounce = this.physics.update();
            if (paddleBounce === 'paddleOne')
                this.playerOnePaddleBounce++;
            else if (paddleBounce === 'paddleTwo')
                this.playerTwoPaddleBounce++;

            if (this.scorePoints())
            {
                this.physics.reset();
                if (this.maxScoreReached())
                {
                    this.setWinnerId();
                    this.endGame(GameEndCondition.ScoreLimit);
                    this.gameEventEmitter.emit('gameEnded', this);
                    return;
                }
            }
            this.physics.updatePaddlesPrevPositions();
        }
    }

    private maxScoreReached() : boolean
    {
        return this.playerOneScore === GAME_MAX_SCORE || this.playerTwoScore === GAME_MAX_SCORE;
    }

    private scorePoints(): boolean
    {
        if (this.status != GameStatus.Live)
        {
            return false;
        }

        if (this.physics.ball.center.x < 0)
        {
            this.playerTwoScore += 1;
            return true;
        }
        else if (this.physics.ball.center.x > 100)
        {
            this.playerOneScore += 1;
            return true;
        }
        return false;
    }

    private setWinnerId()
    {
        if (this.playerOneScore === GAME_MAX_SCORE)
        {
            this.winnerId = this.connectionHandler.playerOne.playerId;
        }
        else if (this.playerTwoScore === GAME_MAX_SCORE)
        {
            this.winnerId = this.connectionHandler.playerTwo.playerId;
        }
    }

    private tryStartGame(game: Game): void {
        if (game.connectionHandler.connectedPlayersCount() === 2 && game.status === GameStatus.Pending) {
            game.startCountdown(GameStatus.Live);
            if (game.started === null)
            {
                game.started = new Date(Date.now());
            }
            game.gameEventEmitter.emit('gameStarted', game);
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
        this.connectionHandler.playerOne.sendMessage(message);
        this.connectionHandler.playerTwo.sendMessage(message);
    }

    // TODO: startCountdown could be rewritten somehow
    startCountdown(nextStatus: GameStatus) {
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

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        this.connectionHandler.connectPlayer(playerSessionId, websocket);
        this.gameEventEmitter.emit('playerConnected', this);
    }

    playerLeft() {
        this.endGame(GameEndCondition.PlayerLeft);

        const connectedPlayers = this.connectionHandler.connectedPlayers();
        if (connectedPlayers.size != 1)
        {
            throw new Error();
        }
        
        const winnerPlayerId = connectedPlayers.values().next().value;

        if (winnerPlayerId !== null && winnerPlayerId !== undefined)
        {
            this.winnerId = winnerPlayerId;
        }
    }

    disconnectPlayer(playerId: string): void {
        if (this.connectionHandler.disconnectPlayer(playerId))
        {
            const numberOfConnectedPlayers = this.connectionHandler.connectedPlayersCount();
            if (numberOfConnectedPlayers === 1) {
                this.playerLeft();
                this.gameEventEmitter.emit('gameEnded', this);
            }
        }
    }

    shouldDelete(): boolean
    {
        if (this.status === GameStatus.Ended && this.connectionHandler.connectedPlayersCount() === 0)
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
        this.connectionHandler.playerOne.disconnect();
        this.connectionHandler.playerTwo.disconnect();
        this.lastTimeBothPlayersConnected = null as any;
    }

    movePaddle(sessionId: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        if (this.connectionHandler.playerOne.sessionId === sessionId) {
            this.physics.setPaddleMove('paddleOne', direction);
        } else if (this.connectionHandler.playerTwo.sessionId === sessionId) {
            this.physics.setPaddleMove('paddleTwo', direction);
        }
    }
}