import {Ball} from './ball.js';
import {Paddle} from './paddle.js';
import {Player} from './player.js';
import {GameEndCondition, GameState, GameStatus, GameType} from '../types/game.js';
import {
    BALL_DIAMETER,
    BALL_INIT_SPEED,
    BALL_MAX_SPEED,
    BALL_SPEED_INCREMENT,
    GAME_MAX_SCORE,
    GAME_TIMEOUT,
    MAX_BOUNCE_ANGLE_IN_RADS,
    PADDLE_HEIGHT
} from '../types/game-constants.js';
import {computeCollisionPoint, computeMovingPaddleCollision} from '../utils/collision.js';
import {GameWebSocket} from "../types/websocket.js";
import {PaddlePosition, PaddleSide} from "../types/paddle.js";
import {CollisionPoint} from "../types/point.js";
import { sendGameEvent } from "../services/rabbitMQ-extension.js";

export class Game {
    readonly id: string;
    private ball: Ball;
    private paddleOne: Paddle;
    private paddleTwo: Paddle;
    private playerOne: Player;
    private playerTwo: Player;
    status: GameStatus;
    private countdown: number;
    private playerOneScore: number;
    private playerTwoScore: number;
    private playerOnePaddleBounce: number;
    private playerTwoPaddleBounce: number;
    readonly created: Date;
    private started: Date | null = null;
    private finished: Date | null = null;
    private lastTimeBothPlayersConnected: Date;
    private winnerId: number | null = null;
    readonly gameType: GameType;

    constructor(gameType: GameType = GameType.Normal, playerOneSessionId: string, playerTwoSessionId: string) {
		this.id = crypto.randomUUID();
        this.gameType = gameType;
        this.ball = new Ball();
        this.paddleOne = new Paddle(PaddlePosition.Left);
        this.paddleTwo = new Paddle(PaddlePosition.Right);
        this.status = 'pending';
        this.playerOne = new Player(playerOneSessionId);
        this.playerTwo = new Player(playerTwoSessionId);
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.countdown = 0;
        this.playerOnePaddleBounce = 0;
        this.playerTwoPaddleBounce = 0;
    }

    getCurrentState(): GameState {
        const baseState = {
            status: this.status,
            timestamp: Date.now(),
            playerOne: {
                username: this.playerOne.getUsername(),
                paddle: this.paddleOne.serialize(),
                score: this.playerOneScore
            },
            playerTwo: {
                username: this.playerTwo.getUsername(),
                paddle: this.paddleTwo.serialize(),
                score: this.playerTwoScore
            },
            ball: this.ball.serialize(),
        };

        if (this.status === 'countdown')
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
            playerOneUsername: this.playerOne.getUsername(),
            playerTwoUsername: this.playerTwo.getUsername(),
            playerOneScore: this.playerOneScore,
            playerTwoScore: this.playerTwoScore,
            created: this.created
        };

        return baseStats;
    }

    async sendGameStartedEvent(): Promise<void> {
        try {      
          // Construct the message
          const message = {
            event: 'gameStarted',
            gameId: this.id,
            timestamp: this.started,
            data: {}
          };
      
          // Convert to JSON string and publish
          await sendGameEvent(JSON.stringify(message));
          console.log(`Sent game started event for gameId: ${this.id}`);
        } catch (error) {
          console.error('Failed to send game started event:', error);
          throw error;
        }
    }

    async sendGameFinishedEvent(endCondition: GameEndCondition = GameEndCondition.ScoreLimit): Promise<void> {
        try {
          const message = {
            event: 'gameFinished',
            gameId: this.id,
            timestamp: this.finished,
            data: {
                gameId: this.id,
                gameType: this.gameType,
                endCondition: endCondition,
                playerOne: {
                    id: this.playerOne.getPlayerId(),
                    finalScore: this.playerOneScore,
                    paddleBounce: this.playerOnePaddleBounce,
                },
                playerTwo: {
                    id: this.playerTwo.getPlayerId(),
                    finalScore: this.playerTwoScore,
                    paddleBounce: this.playerTwoPaddleBounce,
                },
                created: this.created,
                started: this.started,
                ended: this.finished,
                duration: this.gameDuration(),
                winnerId: this.winnerId
            }
          };

            sendGameEvent(JSON.stringify(message));
        } catch (error) {
          console.error('Failed to send game finished event:', error);
          throw error;
        }
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



    tick(): void {
        if (this.status === 'live')
        {
            this.ball.update();
            this.handleBounce();
            if (this.scorePoints() && this.checkGameEnd())
            {
                this.finishGame();
            }
            this.updatePaddlesPrevPositions();
        }
        this.broadcastGameState();
    }
    
    broadcastPendingAndFinishedGames()
    {
        if (this.status === 'pending' || this.status === 'finished')
        {
            this.broadcastGameState();
        }
    }

    private updateBallPositionAndVelocityAfterStandardHit(newBallCenter: CollisionPoint, hitPaddle: Paddle)
    {
        if (newBallCenter === null || hitPaddle === null)
        {
            return ;
        }

        this.ball.center.x = newBallCenter.x
        this.ball.center.y = newBallCenter.y;

        if (newBallCenter.paddleSide === PaddleSide.Right || newBallCenter.paddleSide === PaddleSide.Left)
        {

            const currentSpeed = this.ball.speed;
            let newBallSpeed = currentSpeed * BALL_SPEED_INCREMENT;
            if (newBallSpeed > BALL_MAX_SPEED)
            {
                newBallSpeed = BALL_MAX_SPEED;
            }
            this.ball.speed = newBallSpeed;
            
            let paddleCenter = -999;
            if (hitPaddle != null)
            {
                paddleCenter = hitPaddle.getCenterY();
            }
            const hitPosition = (this.ball.center.y - paddleCenter) / (PADDLE_HEIGHT / 2);

            const angle = Math.round(MAX_BOUNCE_ANGLE_IN_RADS * hitPosition * 1000) / 1000;

            this.ball.dy = newBallSpeed * Math.sin(angle);
            this.ball.dx = newBallSpeed * Math.cos(angle);
            
            if (hitPaddle.paddleType === PaddlePosition.Right) {
                this.ball.dx = -Math.abs(this.ball.dx);
            } else {
                this.ball.dx = Math.abs(this.ball.dx);
            }
        }
        else if (newBallCenter.paddleSide === PaddleSide.Top || newBallCenter.paddleSide === PaddleSide.Bottom)
        {
            this.ball.dy = -this.ball.dy;
        }
    }

    private updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter: CollisionPoint)
    {
        if (newBallCenter === null)
        {
            return ;
        }

        this.ball.center.x = newBallCenter.x
        this.ball.center.y = newBallCenter.y;

        // TODO: UPDATE THIS SECTION
        if (this.ball.center.y <= (0 + BALL_DIAMETER / 2) || this.ball.center.y >= (100 - BALL_DIAMETER / 2))
        {
            if (this.ball.center.x <= 50)
            {
                this.ball.center.x = -50;
                this.ball.center.y = 50;
                this.ball.prevCenter.x = -50;
                this.ball.prevCenter.y = 50;
            }
            else
            {
                this.ball.center.x = 150;
                this.ball.center.y = 50;
                this.ball.prevCenter.x = 150;
                this.ball.prevCenter.y = 50;
            }
            return ;
        }
        // END OF TODO: UPDATE THIS SECTION

        if (newBallCenter.paddleSide === PaddleSide.Top)
        {
            this.ball.dy = -Math.abs(this.ball.dy) - BALL_INIT_SPEED;
        }
        else if (newBallCenter.paddleSide === PaddleSide.Bottom)
        {
            this.ball.dy = Math.abs(this.ball.dy) + BALL_INIT_SPEED;
        }
    }

    private ballInsidePaddle(paddle: Paddle, ball: Ball) : boolean
    {
        if (ball.center.y >= paddle.corners[0].y &&
            ball.center.y <= paddle.corners[2].y &&
            ball.center.x <= paddle.corners[2].x &&
            ball.center.x >= paddle.corners[0].x)
        {
            return true;
        }
        return false;
    }

    private handleBordersBounce() : void
    {
        if (this.ball.center.y <= (0 + BALL_DIAMETER/2) || this.ball.center.y >= (100 - BALL_DIAMETER/2) ) {

            this.ball.dy = -this.ball.dy;
            this.ball.center.y = Math.max(0 + BALL_DIAMETER/2, Math.min(100 - BALL_DIAMETER/2, this.ball.center.y));
            
            if (this.ballInsidePaddle(this.paddleOne, this.ball))
            {
                this.ball.center.x = -50;
                this.ball.center.y = 50;
                this.ball.prevCenter.x = -50;
                this.ball.prevCenter.y = 50;
            }
            else if (this.ballInsidePaddle(this.paddleTwo, this.ball))
            {
                this.ball.center.x = 150;
                this.ball.center.y = 50;
                this.ball.prevCenter.x = 150;
                this.ball.prevCenter.y = 50;
            }
        }
    }

    private handleBounce()
    {
        this.handleBordersBounce();

        let newBallCenter: CollisionPoint | null;

        if (newBallCenter = computeCollisionPoint(this.paddleOne, this.ball))
        {
            this.updateBallPositionAndVelocityAfterStandardHit(newBallCenter, this.paddleOne);
            this.playerOnePaddleBounce++;
        }
        else if (newBallCenter = computeCollisionPoint(this.paddleTwo, this.ball))
        {
            this.updateBallPositionAndVelocityAfterStandardHit(newBallCenter, this.paddleTwo);
            this.playerTwoPaddleBounce++;
        }
        else if (newBallCenter = computeMovingPaddleCollision(this.paddleOne, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
        else if (newBallCenter = computeMovingPaddleCollision(this.paddleTwo, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
    }

    private checkGameEnd() : boolean
    {
        return this.playerOneScore === GAME_MAX_SCORE || this.playerTwoScore === GAME_MAX_SCORE;

    }

    private scorePoints(): boolean
    {
        if (this.status != 'live')
        {
            return false;
        }

        if (this.ball.center.x < 0)
        {
            this.playerTwoScore += 1;
            this.resetRound();
            return true;
        }
        else if (this.ball.center.x > 100)
        {
            this.playerOneScore += 1;
            this.resetRound();
            return true;
        }
        return false;
    }

    private updatePaddlesPrevPositions()
    {
        this.paddleOne.updatePrevPosition();
        this.paddleTwo.updatePrevPosition();
    }

    private finishGame(): void
    {
        this.status = 'finished';

        this.paddleOne.reset();
        this.paddleTwo.reset();

        this.ball.reset()
        this.ball.stop();
        if (this.finished === null)
        {
            this.finished = new Date(Date.now());
        }

        if (this.playerOneScore === GAME_MAX_SCORE)
        {
            this.winnerId = this.playerOne.getPlayerId();
        }
        else if (this.playerTwoScore === GAME_MAX_SCORE)
        {
            this.winnerId = this.playerTwo.getPlayerId();
        }

        this.sendGameFinishedEvent(undefined);
    }

    private resetRound(): void {
		this.ball.reset();
    }

    broadcastGameState(): void {
        const message = JSON.stringify(this.getCurrentState());
        this.playerOne.sendMessage(message);
        this.playerTwo.sendMessage(message);
    }

    startCountdown(nextStatus: GameStatus) {
        this.countdown = 3;
        this.status = 'countdown';
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
        if (this.playerOne.sessionId === playerSessionId) {
            this.playerOne.connect(websocket);
        } else if (this.playerTwo.sessionId === playerSessionId) {
            this.playerTwo.connect(websocket);
        } else {
            throw new Error('Player is not in this game');
        }

        if (this.playerOne.isConnected() && this.playerTwo.isConnected() && this.status != 'finished') {
            this.startCountdown('live');
            if (this.started === null)
            {
                this.started = new Date(Date.now());
                this.sendGameStartedEvent();
            }
        }
    }

    disconnectPlayer(playerId: string): void {
        if (this.playerOne.sessionId === playerId) {
            this.playerOne.disconnect();
        } else if (this.playerTwo.sessionId === playerId) {
            this.playerTwo.disconnect();
        }

        if ((!this.playerOne.isConnected() && this.playerTwo.isConnected()) ||
            (this.playerOne.isConnected() && !this.playerTwo.isConnected()))
        {
            this.lastTimeBothPlayersConnected = new Date(Date.now());
        }

        if (this.status != 'finished')
        {
            this.status = 'pending';
        }
    }

    shouldDelete(): boolean
    {
        if (this.status === 'finished' && !this.playerOne.isConnected() && !this.playerTwo.isConnected())
        {
            return true;
        }

        if (this.status === 'pending' || this.status === 'finished')
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
        this.ball = null as any;
        this.paddleOne = null as any;
        this.paddleTwo = null as any;
        this.playerOne.disconnect();
        this.playerTwo.disconnect();
        this.playerOne = null as any;
        this.playerTwo = null as any;
        
        this.lastTimeBothPlayersConnected = null as any;
    }

    movePaddle(playerId: string, direction: number): void {
        if (this.status !== 'live')
        {
            return;
        }

        if (this.playerOne.sessionId === playerId) {
            this.paddleOne.move(direction);
        } else if (this.playerTwo.sessionId === playerId) {
            this.paddleTwo.move(direction);
        }
    }

    getFirstPlayer(): Player {
        return this.playerOne;
    }

    getSecondPlayer(): Player {
        return this.playerTwo;
    }
}