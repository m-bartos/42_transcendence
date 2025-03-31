import {Ball} from './ball.js';
import {Paddle} from './paddle.js';
import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus, GameType} from '../types/game.js';
import {
    GAME_MAX_SCORE,
    GAME_TIMEOUT,
} from '../types/game-constants.js';
import {GameWebSocket} from "../types/websocket.js";
import {PaddlePosition} from "../types/paddle.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {GamePhysicsEngine} from "./game-physics-engine.js";
import {GameConnectionHandler} from "./game-connection-handler.js";

export interface GameOptions {
    gameType?: GameType,
    playerOneSessionId: string,
    playerTwoSessionId: string,
    gameEventPublisher: GameEventsPublisher,
    ball?: Ball,
    paddleOne?: Paddle,
    paddleTwo?: Paddle,
    connectionHandler?: GameConnectionHandler,
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
    private publisher: GameEventsPublisher;
    private connectionHandler: GameConnectionHandler;

    constructor({
                    gameType = GameType.Multiplayer,
                    playerOneSessionId,
                    playerTwoSessionId,
                    gameEventPublisher,
                    ball = new Ball(),
                    paddleOne = new Paddle(PaddlePosition.Left),
                    paddleTwo = new Paddle(PaddlePosition.Right),
                    connectionHandler = new GameConnectionHandler(new Player(playerOneSessionId), new Player(playerTwoSessionId))
                }: GameOptions)
    {
		this.id = crypto.randomUUID();
        this.gameType = gameType;
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
    }

    getCurrentState(): GameState {
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

    getCurrentStatistics() {
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

    sendGameStarted(): void {
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

    // rename to sendGameEnded
    sendGameFinished(endCondition: GameEndCondition  = GameEndCondition.ScoreLimit){
        try
        {
            const message = {
                event: 'game.end',
                gameId: this.id,
                timestamp: this.finished,
                data: {
                    gameId: this.id,
                    gameType: this.gameType,
                    endCondition: endCondition,
                    playerOne: {
                        id: this.connectionHandler.playerOne.getPlayerId(),
                        score: this.playerOneScore,
                        paddleBounce: this.playerOnePaddleBounce,
                    },
                    playerTwo: {
                        id: this.connectionHandler.playerTwo.getPlayerId(),
                        score: this.playerTwoScore,
                        paddleBounce: this.playerTwoPaddleBounce,
                    },
                    created: this.created,
                    started: this.started,
                    ended: this.finished,
                    duration: this.gameDuration(),
                    winnerId: this.winnerId,
                    // looserId: this.looserId
                }
            };
            this.publisher.sendEvent('game.end', JSON.stringify(message));
            console.log(`Sent game ended event for gameId: ${this.id}`);
        }
         catch (error) {
            console.error('Failed to send game started event:', error);
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
                if (this.GameEnded())
                {
                    this.finishGame();
                    this.sendGameFinished();
                }
            }
            this.physics.updatePaddlesPrevPositions();
        }
    }
    
    broadcastPendingAndFinishedGames()
    {
        if (this.status === GameStatus.Pending || this.status === GameStatus.Ended)
        {
            this.broadcastGameState();
        }
    }

    private GameEnded() : boolean
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


    private finishGame(): void
    {
        this.status = GameStatus.Ended;

        this.physics.finishGame();
        if (this.finished === null)
        {
            this.finished = new Date(Date.now());
        }

        if (this.playerOneScore === GAME_MAX_SCORE)
        {
            this.winnerId = this.connectionHandler.playerOne.getPlayerId();
        }
        else if (this.playerTwoScore === GAME_MAX_SCORE)
        {
            this.winnerId = this.connectionHandler.playerTwo.getPlayerId();
        }
    }

    broadcastGameState(): void {
        const message = JSON.stringify(this.getCurrentState());
        this.connectionHandler.playerOne.sendMessage(message);
        this.connectionHandler.playerTwo.sendMessage(message);
    }

    startCountdown(nextStatus: GameStatus) {
        this.countdown = 3;
        this.status = GameStatus.Countdown;
        let count = 2;

        const countdownInterval = setInterval(() => {
            this.countdown = count; // Add countdown value to state
            this.broadcastGameState();

            count--;
            if (count < 0) {
                clearInterval(countdownInterval);
                this.status = nextStatus;
                this.countdown = 0;
                this.broadcastGameState();
            }
        }, 1000); // 1 second per count
    }

    connectPlayer(playerSessionId: string, websocket: GameWebSocket): void {
        this.connectionHandler.connectPlayer(playerSessionId, websocket);

        // should be somewhere else:
        if (this.connectionHandler.bothPlayersConnected() && this.status != GameStatus.Ended) {
            this.startCountdown(GameStatus.Live);
            if (this.started === null)
            {
                this.started = new Date(Date.now());
                this.sendGameStarted();
            }
        }
    }

    disconnectPlayer(playerId: string): void {
        this.connectionHandler.disconnectPlayer(playerId);

        if (this.connectionHandler.onlyOnePlayerConnected())
        {
            this.lastTimeBothPlayersConnected = new Date(Date.now());
        }

        if (this.status != GameStatus.Ended)
        {
            this.status = GameStatus.Pending;
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
            this.physics.movePaddle('paddleOne', direction);
        } else if (this.connectionHandler.playerTwo.sessionId === sessionId) {
            this.physics.movePaddle('paddleTwo', direction);
        }
    }
}