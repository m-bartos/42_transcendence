import { Ball } from './ball_class.js';
import { Paddle } from './paddle_class.js';
import { Player } from './player_class.js';
import { GameState, GameStatus, GameWebSocket } from '../types/game.js';


export class Game {
    readonly id: string;
    private ball: Ball;
    private paddle1: Paddle;
    private paddle2: Paddle;
    private player1: Player;
    private player2: Player;
    private status: GameStatus;
    readonly created_at: Date;

    constructor(player1Id: string, player2Id: string) {
        this.id = crypto.randomUUID();
        this.ball = new Ball();
        this.paddle1 = new Paddle();
        this.paddle2 = new Paddle();
        this.status = 'pending';
        this.player1 = new Player(player1Id);
        this.player2 = new Player(player2Id);
        this.created_at = new Date();
    }

    getState(): GameState {
        return {
            status: this.status,
            paddle1: this.paddle1.serialize(),
            paddle2: this.paddle2.serialize(),
            ball: this.ball.serialize()
        };
    }

    update(): void {
        if (this.status === 'live') {
            this.ball.update();
            this.sendStateToPlayers();
        }
		else if (this.status === 'pending') {
			this.sendStateToPlayers();
		}
    }

    private sendStateToPlayers(): void {
        const message = this.status === 'pending'
            ? JSON.stringify({ status: 'pending' })
            : JSON.stringify(this.getState());

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
    }

    getPlayer1(): Player {
        return this.player1;
    }

    getPlayer2(): Player {
        return this.player2;
    }
}