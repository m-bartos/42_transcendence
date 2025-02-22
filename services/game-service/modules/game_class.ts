import { Ball } from './ball_class.js';
import { Paddle } from './paddle_class.js';
import { Player } from './player_class.js';
import { GameState, GameStatus, GameWebSocket, Point } from '../types/game.js';
import { BALL_SEMIDIAMETER, BALL_DIAMETER, PADDLE_WIDTH, BALL_SPEED, PADDLE_HEIGHT } from '../types/constants.js';
import { ballCollideWithPaddle, calculateCollisionPoint } from './collisionManager.js';
import { resolve } from 'path';

export class Game {
    readonly id: string;
    ball: Ball;
    paddle1: Paddle;
    paddle2: Paddle;
    private player1: Player;
    private player2: Player;
    private status: GameStatus;
    private score1: number;
    private score2: number;
    readonly created_at: Date;

    constructor(player1Id: string, player2Id: string) {
        this.id = '0b879657-b318-4159-b663-882d97f689dd'; // HARDCODED! TODO: update
		// this.id = crypto.randomUUID();
        this.ball = new Ball();
        this.paddle1 = new Paddle('left');
        this.paddle2 = new Paddle('right');
        this.status = 'pending';
        this.player1 = new Player(player1Id);
        this.player2 = new Player(player2Id);
        this.created_at = new Date();
        this.score1 = 0;
        this.score2 = 0;
    }

    getState(): GameState {
        return {
            status: this.status,
            paddle1: this.paddle1.serialize(),
            paddle2: this.paddle2.serialize(),
            ball: this.ball.serialize(),
            score1: this.score1,
            score2: this.score2
        };
    }

    update(): void {
        this.ball.update();
        this.resolveCollisions();
        this.sendStateToPlayers();
}

    private resolveCollisions()
    {
        let collisionPoint: Point | null = null;
        let paddle: Paddle | null = null;
        let paddleNumber: number | null = null;
        
        if (ballCollideWithPaddle(this.paddle1, this.ball))
        {
            this.ball.collision = true;
            collisionPoint = calculateCollisionPoint(this.paddle1, this.ball);
            paddle = this.paddle1;
        }
        else if (ballCollideWithPaddle(this.paddle2, this.ball))
        {
            this.ball.collision = true;
            collisionPoint = calculateCollisionPoint(this.paddle2, this.ball);
            paddle = this.paddle2;
        }
        if (collisionPoint != null && paddle != null)
        {
            // TODO: collisions on horizontal lines
            // Calculate trajectory direction
            const dx = this.ball.dx;
            const dy = this.ball.dy;

            const magnitude = Math.sqrt(dx * dx + dy * dy);

            // Normalize direction components
            const nx = dx / magnitude;
            const ny = dy / magnitude;

            // TODO: better new ball.center according to speed and the distance. 
            this.ball.center.x = collisionPoint.x - (BALL_SEMIDIAMETER + 0.01) * nx ; // TODO: HARDCODED 0.01
            this.ball.center.y = collisionPoint.y - (BALL_SEMIDIAMETER + 0.01) * ny; // TODO: HARDCODED 0.01

            // Find paddle vertical extent
            const minY = Math.min(...paddle.corners.map(p => p.y));
            const maxY = Math.max(...paddle.corners.map(p => p.y));

            // Calculate relative hit position
            const paddleCenterY = (minY + maxY) / 2;
            const relativeHitPos = (collisionPoint.y - paddleCenterY) / (PADDLE_HEIGHT / 2);

            // TODO: make speeds more predictable - speed up each paddle hit
            this.ball.dx = -this.ball.dx;
            this.ball.dy = relativeHitPos * BALL_SPEED * 0.75;

            // Normalize total speed
            const totalSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            if (totalSpeed > BALL_SPEED * 1.5 || totalSpeed < BALL_SPEED * 0.5) {
                const scale = BALL_SPEED / totalSpeed;
                this.ball.dx *= scale;
                this.ball.dy *= scale;
            }
        }
        else
        {
            if (this.ball.center.x < 0)
            {
                this.score2 += 1;
                this.resetRound();
            }
            else if (this.ball.center.x > 100)
            {
                this.score1 += 1;
                this.resetRound();
            }

            if (this.score1 === 10 || this.score2 === 10)
            {
                this.stopGame();
            }
        }
    }

    private stopGame(): void
    {
        this.status = 'finished';
        this.resetRound();
        this.paddle1.reset();
        this.paddle2.reset();
        this.ball.stop();
    }

    private resetRound(): void {
		// this.status = 'waiting';
		this.ball.reset();
		this.ball.start();
        // setTimeout(() => {
        //     if (this.status === 'waiting') {
		// 		this.status = 'live';
        //         this.ball.start();
        //     }
        // }, 1000); // Wait 1 second before starting new round
    }

    private sendStateToPlayers(): void {
        const message = JSON.stringify(this.getState());
        this.player1.sendMessage(message);
        this.player2.sendMessage(message);
    }

    connectPlayer(playerId: string, websocket: GameWebSocket): void {
        if (this.player1.id === playerId) {
            this.player1.connect(websocket);
        } else if (this.player2.id === playerId) {
            this.player2.connect(websocket);
        } else {
            throw new Error('Player not in this game');
        }

        // Check if both players are connected to start game
        if (this.player1.isConnected() && this.player2.isConnected()) {
            this.status = 'live';
            this.ball.start(); // Start ball movement when game goes live
        }
    }

    disconnectPlayer(playerId: string): void {
        if (this.player1.id === playerId) {
            this.player1.disconnect();
        } else if (this.player2.id === playerId) {
            this.player2.disconnect();
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

        if (this.player1.id === playerId) {
            this.paddle1.move(direction);
        } else if (this.player2.id === playerId) {
            this.paddle2.move(direction);
        }
    }

    setStatus(status: GameStatus): void {
        this.status = status;
        if (status === 'live') {
            this.ball.start();
        } else {
            this.ball.reset();
        }
    }

    getPlayer1(): Player {
        return this.player1;
    }

    getPlayer2(): Player {
        return this.player2;
    }
}