import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus,} from '../types/game.js';
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


export class Game {
    // readonly id: string;
    protected playerOne: Player;
    protected playerTwo: Player;
    protected physics: PhysicsEngine;
    status: GameStatus;
    countdown: number;
    playerOnePaddleBounce: number;
    playerTwoPaddleBounce: number;
    created: Date;
    started: Date | null = null;
    ended: Date | null = null;
    lastTimeBothPlayersConnected: Date;
    endCondition: GameEndCondition;
    gameEventEmitter: EventEmitter;
    winnerId: string;
    gameProps: GameProps;

    constructor(
                playerTwo: Player,
                playerOne: Player,
                gameEventEmitter: EventEmitter,
                gameProps: Partial<GameProps> = {},
                physicsEngine?: PhysicsEngine,
                )
    {
        this.gameProps = deepMerge(defaultGameProps, gameProps);

        this.gameEventEmitter = gameEventEmitter;
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;

        // this.id = this.gameProps.gameId;
        this.physics = physicsEngine ?? new PhysicsEngine(this.gameEventEmitter, this.gameProps.paddleConfig, this.gameProps.ballConfig, this.gameProps.canvasConfig);

        this.endCondition = GameEndCondition.Unknown; // TODO: remove?
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now()); // Should be moved to multiplayer

        this.status = GameStatus.Pending;
        this.playerOnePaddleBounce = 0;
        this.playerTwoPaddleBounce = 0;
        this.countdown = 0;

        this.winnerId = '';

        this.initPhysicsListeners();
    }

    setWinnerId(userId: string): void {
        if (userId !== this.playerOne.userId || userId !== this.playerTwo.userId) {
            throw new Error("UserId is not present in game");
        }
        this.winnerId = userId;
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
                this.tryScoreLimitGameEnd();
            } else if (position === BorderPosition.Left) {
                this.playerTwo.addScore();
                this.gameEventEmitter.emit(GameEvents.ScoreAdded);
                this.tryScoreLimitGameEnd();
            }
        })
    }

    // currentStatistics() {
    //     return {
    //         gameId: this.id,
    //         status: this.status,
    //         playerOneUsername: this.playerOne.getUsername(),
    //         playerTwoUsername: this.playerTwo.getUsername(),
    //         playerOneScore: this.playerOne.score,
    //         playerTwoScore: this.playerTwo.score,
    //         created: this.created
    //     };
    // }

    protected gameDuration(): number | undefined {
        if (!this.started || !this.ended)
            return undefined;

        const durationMs = this.ended.getTime() - this.started.getTime();

        if (durationMs < 0) {
            return 0;
        }

        return durationMs / 1000;
    }

    protected tryScoreLimitGameEnd(): void {
        if (this.status === GameStatus.Live && this.isMaxScoreReached()) {
            this.setScoreLimitWinner();
            this.endGame(GameEndCondition.ScoreLimit);
            this.gameEventEmitter.emit(GameEvents.GameEnded);
        }
    }

    public tick(): void {
        if (this.status === GameStatus.Live) {
            this.physics.update();
        }
    }

    protected isMaxScoreReached(): boolean {
        return this.playerOne.score === this.gameProps.maxScore || this.playerTwo.score === this.gameProps.maxScore;
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
        this.lastTimeBothPlayersConnected = new Date(Date.now());

        this.status = GameStatus.Ended;
        this.endCondition = endCondition;

        this.physics.stopAndReset();
        if (this.ended === null) {
            this.ended = new Date(Date.now());
        }
    }

    public emitGameState(): void {
        const message = this.getCurrentState();
        this.gameEventEmitter.emit(GameEvents.GameState, message);
    }

    // TODO: startCountdown could be rewritten somehow
    protected startCountdown(nextStatus: GameStatus) {
        this.status = GameStatus.Countdown;

        let count = 3;
        this.countdown = count;
        this.emitGameState();
        count--;

        const countdownInterval = setInterval(() => {
            if (this.status === GameStatus.Countdown) {
                this.countdown = count; // Add countdown value to state
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

    public getStatus() {
        return this.status;
    }

    destroy(): void {
        this.physics = null as any;
        this.lastTimeBothPlayersConnected = null as any;
        this.gameEventEmitter.removeAllListeners();
    }

    public getCurrentState(): GameState {
        const state: GameState = {
            // id: this.id,
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

    public movePaddle(userId: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        if (this.playerOne.userId === userId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
        } else if (this.playerTwo.userId === userId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
        }
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

}










//
// export class SplitKeyboardGame extends Game {
//     winnerUsername;
//
//     constructor (    gameType = GameType.Multiplayer,
//                      playerOne: SplitKeyboardPlayer,
//                      playerTwo: SplitKeyboardPlayer,
//                      gameEventPublisher: GameEventsPublisher,
//                      gameEventEmitter: EventEmitter,
//                      physicsEngine: PhysicsEngine,
//                      connectionHandler: GameConnectionHandler,
//                      gameConfig?: GameConfig)
//     {
//         super(gameType, playerOne, playerTwo, gameEventPublisher, gameEventEmitter, physicsEngine, connectionHandler, gameConfig);
//         this.winnerUsername = '';
//     }
//
//
//
//     sendGameEnded(): void{
//         try
//         {
//             const gamePrincipal = this.connectionHandler.connectedPlayers().keys().next();
//
//             const message = {
//                 event: 'game.end',
//                 gameId: this.id,
//                 timestamp: this.finished,
//                 gameType: this.gameType,
//                 gamePrincipalId: 'principalId',// where to get this info?
//                 data: {
//                     gameId: this.id,
//                     endCondition: this.endCondition,
//                     playerOne: {
//                         username: this.playerOne.getUsername(),
//                         score: this.playerOne.score,
//                         paddleBounce: this.playerOnePaddleBounce,
//                     },
//                     playerTwo: {
//                         username: this.playerTwo.getUsername(),
//                         score: this.playerTwo.score,
//                         paddleBounce: this.playerTwoPaddleBounce,
//                     },
//                     created: this.created,
//                     started: this.started,
//                     ended: this.finished,
//                     duration: this.gameDuration(),
//                     winnerUsername: this.winnerUsername,
//                     // looserId: game.looserId
//                 }
//             };
//             this.publisher.sendEvent('game.end', JSON.stringify(message));
//             console.log(`Sent game ended event for gameId: ${this.id}`);
//         }
//         catch (error) {
//             console.error('Failed to send game ended event:', error);
//             throw error;
//         }
//     }
//
//     setWinner(): void {
//         if (this.playerOne.score === GAME_MAX_SCORE)
//         {
//             this.winnerUsername = this.playerOne.getUsername();
//         }
//         else if (this.playerTwo.score === GAME_MAX_SCORE)
//         {
//             this.winnerUsername = this.playerTwo.getUsername();
//         }
//     }
//
//     currentState(): SplitkeyboardGameState {
//         const baseState = super.currentState();
//         if (this.status === GameStatus.Ended && this.winnerUsername != null)
//         {
//             return {
//                 ...baseState,
//                 winnerUsername: this.winnerUsername,
//             }
//         }
//         else
//         {
//             return baseState;
//         }
//     }
//
//
// };
//
// export class MultiplayerGame extends Game {
//     winnerId: string;
//
//     constructor (    gameType = GameType.Multiplayer,
//                      playerOne: MultiplayerPlayer,
//                      playerTwo: MultiplayerPlayer,
//                      gameEventPublisher: GameEventsPublisher,
//                      gameEventEmitter: EventEmitter,
//                      physicsEngine: PhysicsEngine,
//                      connectionHandler: GameConnectionHandler,
//                      gameConfig?: GameConfig) {
//         super(gameType, playerOne, playerTwo, gameEventPublisher, gameEventEmitter, physicsEngine, connectionHandler, gameConfig);
//         this.winnerId = '';
//     }
//
//
//     currentState(): MultiplayerGameState {
//         const baseState = {
//             gameType: this.gameType,
//             status: this.status,
//             timestamp: Date.now(),
//             paddles: [
//                 this.physics.serializePaddleOne(),
//                 this.physics.serializePaddleTwo()
//             ],
//             ball: this.physics.serializeBall(),
//             players: [
//                 this.playerOne.serialize(),
//                 this.playerTwo.serialize()
//             ]
//         };
//
//         if (this.status === GameStatus.Countdown)
//         {
//             return {
//                 ...baseState,
//                 countdown: this.countdown,
//             }
//         }
//         else if (this.status === GameStatus.Ended && this.winnerId != null)
//         {
//             return {
//                 ...baseState,
//                 winnerId: this.winnerId,
//             }
//         }
//         else
//         {
//             return baseState;
//         }
//     }
//
//
//
// }