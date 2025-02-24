import { Ball } from './ball_class.js';
import { Paddle } from './paddle_class.js';
import { Player } from './player_class.js';
import { GameState, GameStatus, GameWebSocket, Point, CollisionPoint, PaddleSide } from '../types/game.js';
import { BALL_SEMIDIAMETER, BALL_DIAMETER, PADDLE_WIDTH, BALL_SPEED, PADDLE_HEIGHT, GAME_MAX_SCORE, BALL_SPEED_INCREMENT, BALL_MAX_SPEED, MAX_BOUNCE_ANGLE_IN_RADS as MAX_BOUNCE_ANGLE_IN_RADS } from '../types/constants.js';
import { ballCollideWithPaddle as detectBallPaddleCollision, calculateCollisionPoint as computeCollisionPoint } from './collisionManager.js';

export class Game {
    readonly id: string;
    ball: Ball;
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    private firstPlayer: Player;
    private secondPlayer: Player;
    private status: GameStatus;
    private firstPlayerScore: number;
    private secondPlayerScore: number;
    readonly created: Date;

    constructor(player1Id: string, player2Id: string) {
        this.id = '0b879657-b318-4159-b663-882d97f689dd'; // HARDCODED! TODO: update
		// this.id = crypto.randomUUID();
        this.ball = new Ball();
        this.leftPaddle = new Paddle('left');
        this.rightPaddle = new Paddle('right');
        this.status = 'pending';
        this.firstPlayer = new Player(player1Id);
        this.secondPlayer = new Player(player2Id);
        this.created = new Date();
        this.firstPlayerScore = 0;
        this.secondPlayerScore = 0;
    }

    getCurrentState(): GameState {
        return {
            status: this.status,
            paddle1: this.leftPaddle.serialize(),
            paddle2: this.rightPaddle.serialize(),
            ball: this.ball.serialize(),
            score1: this.firstPlayerScore,
            score2: this.secondPlayerScore,
            timestamp: Date.now()
        };
    }

    tick(): void {
        this.ball.update();
        this.handleCollisions();
        if (this.scorePoints())
        {
            this.checkGameEnd();
        }
        this.broadcastGameState();
    }

    private handleCollisions()
    {
        let newBallCenter: CollisionPoint | null = null;
        let hitPaddle: Paddle | null = null;
 
        if (detectBallPaddleCollision(this.leftPaddle, this.ball))
        {
            newBallCenter = computeCollisionPoint(this.leftPaddle, this.ball);
            hitPaddle = this.leftPaddle;
        }
        else if (detectBallPaddleCollision(this.rightPaddle, this.ball))
        {
            newBallCenter = computeCollisionPoint(this.rightPaddle, this.ball);
            hitPaddle = this.rightPaddle;
        }
        if (newBallCenter != null && hitPaddle != null)
        {
            this.ball.center.x = newBallCenter.x
            this.ball.center.y = newBallCenter.y;

            if (newBallCenter.paddleSide === PaddleSide.Right || newBallCenter.paddleSide === PaddleSide.Left)
            {
                
                // const currentSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
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

                const maxAngle = MAX_BOUNCE_ANGLE_IN_RADS;
                const angle = Math.round(MAX_BOUNCE_ANGLE_IN_RADS * hitPosition * 1000) / 1000;

                this.ball.dy = newBallSpeed * Math.sin(angle);
                this.ball.dx = newBallSpeed * Math.cos(angle);
                
                // Ensure correct direction based on which paddle was hit
                if (hitPaddle.paddleType === 'right') {
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
    }

    private checkGameEnd()
    {
        if (this.firstPlayerScore === GAME_MAX_SCORE || this.secondPlayerScore === GAME_MAX_SCORE)
        {
            this.finishGame();
        }
    }

    private scorePoints(): boolean
    {
        if (this.status != 'live')
        {
            return false;
        }

        if (this.ball.center.x < 0)
        {
            this.secondPlayerScore += 1;
            this.resetRound();
            return (true);
        }
        else if (this.ball.center.x > 100)
        {
            this.firstPlayerScore += 1;
            this.resetRound();
            return (true);
        }
        return (false);
    }

    private finishGame(): void
    {
        this.status = 'finished';
        this.resetRound();
        this.leftPaddle.reset();
        this.rightPaddle.reset();
        this.ball.stop();
    }

    private resetRound(): void {
		this.ball.reset();
		this.ball.start();
    }

    private broadcastGameState(): void {
        const message = JSON.stringify(this.getCurrentState());
        this.firstPlayer.sendMessage(message);
        this.secondPlayer.sendMessage(message);
    }

    connectPlayer(playerId: string, websocket: GameWebSocket): void {
        if (this.firstPlayer.id === playerId) {
            this.firstPlayer.connect(websocket);
        } else if (this.secondPlayer.id === playerId) {
            this.secondPlayer.connect(websocket);
        } else {
            throw new Error('Player not in this game');
        }

        // Check if both players are connected to start game
        if (this.firstPlayer.isConnected() && this.secondPlayer.isConnected()) {
            this.status = 'live';
            this.ball.start(); // Start ball movement when game goes live
        }
    }

    disconnectPlayer(playerId: string): void {
        if (this.firstPlayer.id === playerId) {
            this.firstPlayer.disconnect();
        } else if (this.secondPlayer.id === playerId) {
            this.secondPlayer.disconnect();
        }

        // If any player disconnects, set game to pending
        this.status = 'pending';
        // this.ball.reset(); // Reset ball when game is interrupted
    }

    movePaddle(playerId: string, direction: number): void {
        if (this.status !== 'live')
        {
            return;
        }

        if (this.firstPlayer.id === playerId) {
            this.leftPaddle.move(direction);
        } else if (this.secondPlayer.id === playerId) {
            this.rightPaddle.move(direction);
        }
    }

    updateGameStatus(status: GameStatus): void {
        this.status = status;
        if (status === 'live') {
            this.ball.start();
        } else {
            this.ball.reset();
        }
    }

    getFirstPlayer(): Player {
        return this.firstPlayer;
    }

    getSecondPlayer(): Player {
        return this.secondPlayer;
    }
}