import { Ball } from './ball_class.js';
import { Paddle } from './paddle_class.js';
import { Player } from './player_class.js';
import { GameState, GameStatus, GameWebSocket } from '../types/game.js';
import { PADDLE_WIDTH } from '../types/constants.js';

export class Game {
    readonly id: string;
    private ball: Ball;
    private paddle1: Paddle;
    private paddle2: Paddle;
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
        this.paddle1 = new Paddle();
        this.paddle2 = new Paddle();
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
        if (this.status === 'live') {
            // Update ball position
            this.ball.update();

            // Check for paddle collisions
            // Left paddle is at x=0, right paddle at x=100-PADDLE_WIDTH
            const didHitPaddle1 = this.ball.checkPaddleCollision(
                0, 
                this.paddle1.y_cor, 
                true
            );
            
            const didHitPaddle2 = this.ball.checkPaddleCollision(
                100 - PADDLE_WIDTH, 
                this.paddle2.y_cor, 
                false
            );

            // Check for scoring (ball past paddles)
            if (!didHitPaddle1 && !didHitPaddle2) {
				if (this.ball.x <= -this.ball.diameter) {
					// Player 2 scores
					this.score2++;
					this.resetRound();
				} else if (this.ball.x >= 100 + this.ball.diameter) {
					// Player 1 scores
					this.score1++;
					this.resetRound();
				}
			}
		}
		this.sendStateToPlayers();
}

    private resetRound(): void {
		// this.status = 'waiting';
		this.ball.reset()
		this.ball.start()
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

    movePaddle(playerId: string, position: number): void {
        if (this.status !== 'live') return;

        if (this.player1.id === playerId) {
            this.paddle1.move(position);
        } else if (this.player2.id === playerId) {
            this.paddle2.move(position);
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