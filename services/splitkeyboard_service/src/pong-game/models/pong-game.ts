import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus} from '../types/game.js';
import {GAME_MAX_SCORE} from '../../config/game-config.js';

import {EventEmitter} from 'node:events';
import {PaddlePosition} from "../types/paddle.js";
import {PhysicsEngine} from "./physics-engine.js";
import {BorderPosition} from "./vertical-border.js";
import {GameEvents} from "../types/game-events.js";
import {PADDLE_CONFIG, PaddleConfig} from "../../config/paddle-config.js";
import {BALL_CONFIG, BallConfig} from "../../config/ball-config.js";
import {CANVAS_CONFIG, CanvasConfig} from "../../config/canvas-config.js";

import {deepMerge} from "../utils/deep-merge.js"

interface GameProps {
    maxScore: number;
    ballConfig: BallConfig;
    paddleConfig: PaddleConfig;
    canvasConfig: CanvasConfig;
}

const defaultGameProps: GameProps = {
    maxScore: GAME_MAX_SCORE,
    ballConfig: BALL_CONFIG,
    paddleConfig: PADDLE_CONFIG,
    canvasConfig: CANVAS_CONFIG,
}

export interface GameInterface {
    getStatus(): GameStatus;
    tick(): void;
    getCurrentState(): GameState;
    movePaddle(userId: number, direction: number): void;
    movePaddleByUsername(username: string, direction: number): void;
    setWinnerId(userId: number): void;
    startGame(): void;
    endGame(endCondition: GameEndCondition): void;
    emitGameState(): void;
    destroy(): void;
}

export class PongGame implements GameInterface {
    private playerOne: Player;
    private playerTwo: Player;
    private physics: PhysicsEngine;
    private status: GameStatus;
    private countdown: number;
    readonly created: Date;
    private started: Date | null = null;
    private ended: Date | null = null;
    private endCondition: GameEndCondition;
    private gameEventEmitter: EventEmitter;
    private winnerId: number;
    private gameProps: GameProps;

    constructor(
                playerOne: Player,
                playerTwo: Player,
                gameEventEmitter: EventEmitter,
                gameProps: Partial<GameProps> = {},
                physicsEngine?: PhysicsEngine,
                )
    {
        this.gameProps = deepMerge(defaultGameProps, gameProps);
        this.gameEventEmitter = gameEventEmitter;
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.physics = physicsEngine ?? new PhysicsEngine(this.gameEventEmitter, this.gameProps.paddleConfig, this.gameProps.ballConfig, this.gameProps.canvasConfig);
        this.endCondition = GameEndCondition.Unknown;
        this.created = new Date(Date.now());
        this.status = GameStatus.Pending;
        this.countdown = 0;
        this.winnerId = 0;
        this.initPhysicsListeners();
    }

    //region Public Methods
    public getStatus(): GameStatus {
        return this.status;
    }

    public tick(): void {
        if (this.status === GameStatus.Live) {
            this.physics.update();
        }
    }

    public getCurrentState(): GameState {
        const state: GameState = {
            status: this.status,
            timestamp: Date.now(),
            canvas: {
                width: this.gameProps.canvasConfig.width,
                height: this.gameProps.canvasConfig.height,
            },
            paddles: [
                this.physics.serializePaddleOne(),
                this.physics.serializePaddleTwo()
            ],
            ball: this.physics.serializeBall(),
            players: [
                this.playerOne.serialize(),
                this.playerTwo.serialize()
            ],
            created: this.created
        };

        if (this.started) {
            state.started = this.started;
        }

        if (this.status === GameStatus.Countdown) {
            state.countdown = this.countdown;
        }

        if (this.status === GameStatus.Ended && this.ended) {
            state.endCondition = this.endCondition;
            state.winnerId = this.winnerId;
            state.ended = this.ended;
            state.duration = this.gameDuration();
        }

        return state;
    }

    public movePaddle(userId: number, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        // TODO: shall this check be there or not?
        if (this.playerOne.userId === userId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
        } else if (this.playerTwo.userId === userId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
        }
    }

    public movePaddleByUsername(username: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        if (this.playerOne.getUsername() === username) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
        } else if (this.playerTwo.getUsername() === username) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
        }
    }

    public setWinnerId(userId: number): void {
        if (userId !== this.playerOne.userId && userId !== this.playerTwo.userId) {
            throw new Error("UserId is not present in game");
        }
        this.winnerId = userId;
    }

    public startGame(): void {
        if (this.status === GameStatus.Pending) {
            this.startCountdown(GameStatus.Live);
            if (this.started === null) {
                this.started = new Date(Date.now());
            }
            this.gameEventEmitter.emit(GameEvents.GameStarted);
        }
    }

    public endGame(endCondition: GameEndCondition): void {
        this.status = GameStatus.Ended;
        this.endCondition = endCondition;

        this.physics.stopAndReset();
        if (this.ended === null) {
            this.ended = new Date(Date.now());
        }
        this.gameEventEmitter.emit(GameEvents.GameEnded);
    }

    public emitGameState(): void {
        const message = this.getCurrentState();
        this.gameEventEmitter.emit(GameEvents.GameState, message);
    }

    public destroy(): void {
        if (this.physics)
        {
            this.physics.destroy();
            this.physics = null as any;
        }
        this.destroyListeners();
        // this.gameEventEmitter.removeAllListeners();
    }
    //endregion Public Methods

    //region Private Methods
    private initPhysicsListeners(): void {
        this.gameEventEmitter.addListener(GameEvents.PaddleBounce, (position: PaddlePosition) => {

            if (position === PaddlePosition.Right) {
                this.playerOne.addPaddleBounce();
            } else if (position === PaddlePosition.Left) {
                this.playerTwo.addPaddleBounce();
            }
        })

        this.gameEventEmitter.addListener(GameEvents.Score, (position: BorderPosition) => {
            if (position === BorderPosition.Right) {
                this.playerOne.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
                this.tryScoreLimitGameEnd();
            } else if (position === BorderPosition.Left) {
                this.playerTwo.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
                this.tryScoreLimitGameEnd();
            }
        })
    }

    private destroyListeners(): void {
        // TODO: implement destroyListeners
    }

    private gameDuration(): number | undefined {
        if (!this.started || !this.ended)
            return undefined;

        const durationMs = this.ended.getTime() - this.started.getTime();

        if (durationMs < 0) {
            return 0;
        }

        return durationMs / 1000;
    }

    private tryScoreLimitGameEnd(): void {
        if (this.status === GameStatus.Live && this.isMaxScoreReached()) {
            this.emitGameState();
            this.setScoreLimitWinner();
            this.endGame(GameEndCondition.ScoreLimit);
        }
    }

    private isMaxScoreReached(): boolean {
        return this.playerOne.score === this.gameProps.maxScore || this.playerTwo.score === this.gameProps.maxScore;
    }

    // TODO: startCountdown could be rewritten somehow
    private startCountdown(nextStatus: GameStatus) {
        this.status = GameStatus.Countdown;

        let count = 3;
        this.countdown = count;
        this.emitGameState();
        count--;

        const countdownInterval = setInterval(() => {
            if (this.status === GameStatus.Countdown) {
                this.countdown = count;
                this.emitGameState();

                count--;
                if (count < 0) {
                    clearInterval(countdownInterval);
                    this.status = nextStatus;
                    this.countdown = 0;
                    this.emitGameState();
                }
            }
        }, 1000);
    }

    private setScoreLimitWinner(): void
    {
        if (this.playerOne.score === this.gameProps.maxScore)
        {
            this.winnerId = this.playerOne.userId;
        }
        else if (this.playerTwo.score === this.gameProps.maxScore)
        {
            this.winnerId = this.playerTwo.userId;
        }
    }

    //endregion Private Methods
}