import {Paddle} from "./paddle.js";
import {Ball} from "./ball.js";
import {CollisionPoint} from "../types/point.js";
import {computeCollisionPoint, computeMovingPaddleCollision} from "../utils/collision.js";
import {
    BALL_DIAMETER, BALL_INIT_SPEED,
    BALL_MAX_SPEED,
    BALL_SPEED_INCREMENT,
    MAX_BOUNCE_ANGLE_IN_RADS,
    PADDLE_HEIGHT
} from "../types/game-constants.js";
import {PaddlePosition, PaddleSide} from "../types/paddle.js";

export class GamePhysicsEngine {
    ball: Ball;
    paddleOne: Paddle;
    paddleTwo: Paddle;


    constructor(ball: Ball, paddleOne: Paddle, paddleTwo:Paddle) {
        this.ball = ball;
        this.paddleOne = paddleOne;
        this.paddleTwo = paddleTwo;
    }

    movePaddle(paddle: string, direction: number)
    {
        if (paddle === 'paddleOne')
        {
            this.paddleOne.move(direction);
        }
        else if (paddle === 'paddleTwo')
        {
            this.paddleTwo.move(direction);
        }
    }

    update():string {
        this.ball.update();
        return this.handleBounce();
    }

    reset()
    {
        this.ball.reset();
    }

    handleBounce(): string
    {
        this.handleBordersBounce();

        let newBallCenter: CollisionPoint | null;

        if (newBallCenter = computeCollisionPoint(this.paddleOne, this.ball))
        {
            this.updateBallPositionAndVelocityAfterStandardHit(newBallCenter, this.paddleOne);
            return 'paddleOne';
        }
        else if (newBallCenter = computeCollisionPoint(this.paddleTwo, this.ball))
        {
            this.updateBallPositionAndVelocityAfterStandardHit(newBallCenter, this.paddleTwo);
            return 'paddleTwo';
        }
        else if (newBallCenter = computeMovingPaddleCollision(this.paddleOne, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
        else if (newBallCenter = computeMovingPaddleCollision(this.paddleTwo, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
        return "";
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

    updatePaddlesPrevPositions()
    {
        this.paddleOne.updatePrevPosition();
        this.paddleTwo.updatePrevPosition();
    }

    finishGame()
    {
        this.paddleOne.reset();
        this.paddleTwo.reset();

        this.ball.reset()
        this.ball.stop();
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



}