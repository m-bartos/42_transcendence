import {Ball} from './ball.js';
import {Paddle} from './paddle.js';
import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus, GameType} from '../types/game.js';
import {GAME_MAX_SCORE, GAME_TIMEOUT,} from '../types/game-constants.js';
import {GameWebSocket} from "../types/websocket.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GamePhysicsEngine} from "./game-physics-engine.js";
import {GameConnectionHandler, MultiplayerConnectionHandler, SingleBrowserConnectionHandler} from "./game-connection-handler.js";

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
    playerOne: Player;
    playerTwo: Player;
    physics: GamePhysicsEngine;
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
                    ball = undefined,
                    paddleOne = undefined,
                    paddleTwo = undefined,
                    connectionHandler = new MultiplayerConnectionHandler(playerOneSessionId, playerTwoSessionId),
                    gameEventEmitter = new EventEmitter(),
                }: GameOptions)
    {
		this.id = crypto.randomUUID();
        // TODO: implement playerId
        this.playerOne = new Player(playerOneSessionId, "-99");
        this.playerTwo = new Player(playerTwoSessionId, "-99");
        this.playerOnePaddleBounce = 0;
        this.playerTwoPaddleBounce = 0;

        this.physics = new GamePhysicsEngine(ball, paddleOne, paddleTwo);

        this.connectionHandler = connectionHandler;

        this.gameType = gameType;
        this.status = GameStatus.Pending;

        this.endCondition = GameEndCondition.Unknown;
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        this.countdown = 0;

        this.publisher = gameEventPublisher;

        this.gameEventEmitter = gameEventEmitter;

        this.gameEventEmitter.on('gameEnded', this.sendGameEnded);
        this.gameEventEmitter.on('playerConnected', this.tryStartGame);
        this.gameEventEmitter.on('playerDisconnected', this.checkGameEnd);
        this.gameEventEmitter.on('gameStarted', this.sendGameStarted);
    }

    currentState(): GameState {
       const baseState = {
            gameType: this.gameType,
            status: this.status,
            timestamp: Date.now(),
            playerOne: {
                username: this.playerOne.playerId,
                paddle: this.physics.paddleOne.serialize(),
                score: this.playerOne.score
            },
            playerTwo: {
                username: this.playerOne.playerId,
                paddle: this.physics.paddleTwo.serialize(),
                score: this.playerTwo.score
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

    sendGameEnded(game: Game): void{
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
                        id: game.playerOne.playerId,
                        score: game.playerOne.score,
                        paddleBounce: game.playerOnePaddleBounce,
                    },
                    playerTwo: {
                        id: game.playerTwo.playerId,
                        score: game.playerTwo.score,
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

    checkGameEnd(game: Game): void {
        if (game.status === GameStatus.Ended) return;

        const numberOfConnectedPlayers = game.connectionHandler.connectedPlayersCount();
        if (numberOfConnectedPlayers === 1) {
            game.playerLeft();
            game.gameEventEmitter.emit('gameEnded', game);
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
        }
    }

    private maxScoreReached() : boolean
    {
        return this.playerOne.score === GAME_MAX_SCORE || this.playerTwo.score === GAME_MAX_SCORE;
    }

    private scorePoints(): boolean
    {
        if (this.status != GameStatus.Live)
        {
            return false;
        }

        if (this.physics.isBallPastLeftPaddle())
        {
            this.playerTwo.addScore();
            return true;
        }
        else if (this.physics.isBallPastRightPaddle())
        {
            this.playerOne.addScore();
            return true;
        }
        return false;
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

    private tryStartGame(game: Game): void {
        if (game.connectionHandler.allPlayersConnected() && game.status === GameStatus.Pending) {
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
        // this.connectionHandler.playerOne.sendMessage(message);
        // this.connectionHandler.playerTwo.sendMessage(message);
        this.connectionHandler.sendMessage(message);
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
        
        const winnerPlayerSessionId = connectedPlayers.keys().next().value;

        if (winnerPlayerSessionId !== null && winnerPlayerSessionId !== undefined)
        {
            // TODO: implement playerId
            // this.winnerId = winnerPlayerSessionId;
            this.winnerId = "-99";
        }
    }

    disconnectPlayer(playerSessionId: string): void {
        if (this.connectionHandler.disconnectPlayer(playerSessionId))
        {
            this.gameEventEmitter.emit('playerDisconnected', this);
        }
    }

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
    }

    movePaddle(sessionId: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        if (this.playerOne.sessionId === sessionId) {
            this.physics.setPaddleMove('paddleOne', direction);
        } else if (this.playerTwo.sessionId === sessionId) {
            this.physics.setPaddleMove('paddleTwo', direction);
        }
    }
}