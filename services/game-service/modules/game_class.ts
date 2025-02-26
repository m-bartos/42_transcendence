import { Ball } from './ball_class.js';
import { Paddle } from './paddle_class.js';
import { Player } from './player_class.js';
import { GameState, GameStatus, GameWebSocket, Point, CollisionPoint, PaddleSide, PaddlePosition } from '../types/game.js';
import { BALL_DIAMETER, BALL_INIT_SPEED, PADDLE_HEIGHT, GAME_MAX_SCORE, BALL_SPEED_INCREMENT, BALL_MAX_SPEED, MAX_BOUNCE_ANGLE_IN_RADS, GAME_TIMEOUT } from '../types/constants.js';
import { computeCollisionPoint, computeMovingPaddleCollision } from './collisionManager.js';
import { calculateDistance } from './math_module.js';

export class Game {
    readonly id: string;
    private ball: Ball;
    private leftPaddle: Paddle;
    private rightPaddle: Paddle;
    private firstPlayer: Player;
    private secondPlayer: Player;
    status: GameStatus;
    private firstPlayerScore: number;
    private secondPlayerScore: number;
    readonly created: Date;
    private lastTimeBothPlayersConnected: Date;

    constructor(player1Id: string, player2Id: string) {
        this.id = '0b879657-b318-4159-b663-882d97f689dd'; // HARDCODED! TODO: update
		// this.id = crypto.randomUUID();
        this.ball = new Ball();
        this.leftPaddle = new Paddle(PaddlePosition.Left);
        this.rightPaddle = new Paddle(PaddlePosition.Right);
        this.status = 'pending';
        this.firstPlayer = new Player(player1Id);
        this.secondPlayer = new Player(player2Id);
        this.created = new Date(Date.now());
        this.lastTimeBothPlayersConnected = new Date(Date.now());
        this.firstPlayerScore = 0;
        this.secondPlayerScore = 0;
    }

    getCurrentState(): GameState {
        return {
            status: this.status,
            paddleOne: this.leftPaddle.serialize(),
            paddleTwo: this.rightPaddle.serialize(),
            ball: this.ball.serialize(),
            playerOneScore: this.firstPlayerScore,
            playerTwoScore: this.secondPlayerScore,
            timestamp: Date.now()
        };
    }

    tick(): void {
        if (this.status === 'live')
        {
            this.ball.update();
            this.handleBounce();
            if (this.scorePoints())
            {
                this.checkGameEnd();
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
        if (this.ball.center.y <= (0 + BALL_DIAMETER/2) || this.ball.center.y >= (100 - BALL_DIAMETER/2))
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
            
            if (this.ballInsidePaddle(this.leftPaddle, this.ball))
            {
                this.ball.center.x = -50;
                this.ball.center.y = 50;
                this.ball.prevCenter.x = -50;
                this.ball.prevCenter.y = 50;
            }
            else if (this.ballInsidePaddle(this.rightPaddle, this.ball))
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

        let newBallCenter: CollisionPoint | null = null;

        if (newBallCenter = computeCollisionPoint(this.leftPaddle, this.ball))
        {
            this.updateBallPositionAndVelocityAfterStandardHit(newBallCenter, this.leftPaddle)
        }
        else if (newBallCenter = computeCollisionPoint(this.rightPaddle, this.ball))
        {
            this.updateBallPositionAndVelocityAfterStandardHit(newBallCenter, this.rightPaddle)
        }
        else if (newBallCenter = computeMovingPaddleCollision(this.leftPaddle, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
        else if (newBallCenter = computeMovingPaddleCollision(this.rightPaddle, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
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

    private updatePaddlesPrevPositions()
    {
        this.leftPaddle.updatePrevPosition();
        this.rightPaddle.updatePrevPosition();
    }

    private finishGame(): void
    {
        this.status = 'finished';

        this.leftPaddle.reset();
        this.rightPaddle.reset();

        this.ball.reset()
        this.ball.stop();
    }

    private resetRound(): void {
		this.ball.reset();
    }

    broadcastGameState(): void {
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

        if (this.firstPlayer.isConnected() && this.secondPlayer.isConnected() && this.status != 'finished') {
            this.status = 'live';
        }
    }

    disconnectPlayer(playerId: string): void {
        if (this.firstPlayer.id === playerId) {
            this.firstPlayer.disconnect();
        } else if (this.secondPlayer.id === playerId) {
            this.secondPlayer.disconnect();
        }

        if ((!this.firstPlayer.isConnected() && this.secondPlayer.isConnected()) ||
            (this.firstPlayer.isConnected() && !this.secondPlayer.isConnected()))
        {
            this.lastTimeBothPlayersConnected = new Date(Date.now());;
        }

        if (this.status != 'finished')
        {
            this.status = 'pending';
        }
    }

    shouldDelete(): boolean
    {
        if (this.status != 'pending')
        {
            return false;
        }

        const currentTime = new Date();
        const timeSinceLastConnected = currentTime.getTime() - this.lastTimeBothPlayersConnected.getTime();
        if (timeSinceLastConnected > GAME_TIMEOUT * 1000)
        {
            return true;
        }

        return false;
    }

    destroy(): void {
        this.ball = null as any;
        this.leftPaddle = null as any;
        this.rightPaddle = null as any;
        this.firstPlayer.disconnect();
        this.secondPlayer.disconnect();
        this.firstPlayer = null as any;
        this.secondPlayer = null as any;
        
        this.lastTimeBothPlayersConnected = null as any;
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

    getFirstPlayer(): Player {
        return this.firstPlayer;
    }

    getSecondPlayer(): Player {
        return this.secondPlayer;
    }
}