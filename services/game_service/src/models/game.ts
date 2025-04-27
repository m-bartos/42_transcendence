import {Player} from './player.js';
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
import {GameStats} from "../types/game-stats.js";

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
    gameType: GameType;
    endCondition: GameEndCondition;
    gameEventEmitter: EventEmitter;
    winnerId: string;

    constructor(gameType = GameType.Multiplayer,
                          playerOne: Player,
                          playerTwo: Player,
                          gameEventEmitter: EventEmitter,
                          physicsEngine: PhysicsEngine = new PhysicsEngine(gameEventEmitter),
              ){

        this.id = crypto.randomUUID();
        this.gameEventEmitter = gameEventEmitter;

        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.playerOnePaddleBounce = 0;
        this.playerTwoPaddleBounce = 0;

        this.physics = physicsEngine;

        // this.connectionHandler = connectionHandler;

        this.gameType = gameType;
        this.status = GameStatus.Pending;

        this.endCondition = GameEndCondition.Unknown;
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        this.countdown = 0;

        this.winnerId = '';
        this.gameEventEmitter.on(GameEvents.ScoreAdded, () => {
            this.tryScoreLimitGameEnd()
        });

        this.initPhysicsListeners();
    }

    setWinnerId(winnerId: string): void {
        this.winnerId = winnerId;
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

    startGame(): void {
        if (this.status === GameStatus.Pending) {
            this.startCountdown(GameStatus.Live);
            if (this.started === null) {
                this.started = new Date(Date.now());
            }
            this.gameEventEmitter.emit(GameEvents.GameStarted);
        }
    }

    endGame(endCondition: GameEndCondition): void {
        this.lastTimeBothPlayersConnected = new Date(Date.now());

        this.status = GameStatus.Ended;
        this.endCondition = endCondition;

        this.physics.stopAndReset();
        if (this.finished === null) {
            this.finished = new Date(Date.now());
        }
    }

    broadcastGameState(): void {
        const message = this.currentState();
        this.gameEventEmitter.emit(GameEvents.Update, message);
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

    getStatus() {
        return this.status;
    }

    destroy(): void {
        this.physics = null as any;
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

    gameEndedState(): any{
        try
        {
            const message = {
                event: 'game.end',
                gameId: this.id,
                timestamp: this.finished,
                gameType: this.gameType,
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

    movePaddle(userId: string, direction: number): void {
        if (this.status !== GameStatus.Live)
        {
            return;
        }

        console.log(userId);
        console.log(this.playerOne.userId);
        console.log(this.playerTwo.userId);

        if (this.playerOne.userId === userId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Left, direction);
        } else if (this.playerTwo.userId === userId) {
            this.gameEventEmitter.emit(GameEvents.MovePaddle, PaddlePosition.Right, direction);
        }
    }

    setWinner(): void
    {
        if (this.playerOne.score === GAME_MAX_SCORE)
        {
            this.winnerId = this.playerOne.userId;
        }
        else if (this.playerTwo.score === GAME_MAX_SCORE)
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
//     currentState(): SplitkeybordGameState {
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