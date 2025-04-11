import {Paddle} from "./paddle.js";
import {Ball} from "./ball.js";
import {CollisionPoint} from "../types/point.js";
import {computeCollisionPoint, computeMovingPaddleCollisionPoint} from "../utils/collision.js";
import {
    BALL_DIAMETER, BALL_INIT_SPEED,
    BALL_MAX_SPEED,
    BALL_SPEED_INCREMENT,
    MAX_BOUNCE_ANGLE_IN_RADS,
    PADDLE_HEIGHT, PADDLE_INIT_POSITION
} from "../types/game-constants.js";
import {PaddlePosition, RectangleSide} from "../types/paddle.js";

export class GamePhysicsEngine {
    ball: Ball;
    paddleOne: Paddle;
    paddleTwo: Paddle;

    constructor(ball: Ball | undefined, paddleOne: Paddle | undefined, paddleTwo:Paddle | undefined) {
        this.ball = ball ?? new Ball();
        this.paddleOne = paddleOne ?? new Paddle(PaddlePosition.Left);
        this.paddleTwo = paddleTwo ?? new Paddle(PaddlePosition.Right);
    }

    isBallPastLeftPaddle(): boolean {
        return this.ball.centerX < 0;
    }

    isBallPastRightPaddle(): boolean {
        return this.ball.centerX > 100;
    }

    setPaddleMove(paddle: string, direction: number)
    {
        if (paddle === 'paddleOne')
        {
            this.paddleOne.setMove(direction);
        }
        else if (paddle === 'paddleTwo')
        {
            this.paddleTwo.setMove(direction);
        }
    }

    update():string {
        this.paddleOne.update();
        this.paddleTwo.update();
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
        else if (newBallCenter = computeMovingPaddleCollisionPoint(this.paddleOne, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
        else if (newBallCenter = computeMovingPaddleCollisionPoint(this.paddleTwo, this.ball))
        {
            this.updateBallPositionAndVelocityAfterMovingPaddleHit(newBallCenter);
        }
        return "";
    }

    private handleBordersBounce() : void
    {
        if (this.ball.centerY <= (0 + BALL_DIAMETER/2) || this.ball.centerY >= (100 - BALL_DIAMETER/2) ) {

            this.ball.horizontalBordersBounce();

            if (this.paddleOne.isPointInside(this.ball.center))
            {
                //TODO: how to signalize, that point should be given without moving the ball to ridiculous positions like this?
                this.ball.center = { x: -50, y: 50 };
                this.ball.prevCenter.x = -50;
                this.ball.prevCenter.y = 50;
            }
            else if (this.paddleOne.isPointInside(this.ball.center))
            {
                //TODO: how to signalize, that point should be given without moving the ball to ridiculous positions like this?
                this.ball.center = { x: 150, y: 50 };
                this.ball.prevCenter.x = 150;
                this.ball.prevCenter.y = 50;
            }
        }
    }

    stopAndReset()
    {
        this.paddleOne.setPosition(PADDLE_INIT_POSITION);
        this.paddleTwo.setPosition(PADDLE_INIT_POSITION);

        this.ball.reset()
        this.ball.stop();
    }


    private updateBallPositionAndVelocityAfterStandardHit(collisionPoint: CollisionPoint, hitPaddle: Paddle)
    {
        this.ball.center = collisionPoint;

        if (collisionPoint.paddleSide === RectangleSide.Right || collisionPoint.paddleSide === RectangleSide.Left)
        {
            this.ball.speedUp();
            const newBallSpeed = this.ball.speed;

            const paddleCenter = hitPaddle.getCenterY();
            const hitPosition = Math.max(-1, Math.min(1, (this.ball.center.y - paddleCenter) / (PADDLE_HEIGHT / 2)));

            const angle = MAX_BOUNCE_ANGLE_IN_RADS * hitPosition;

            const dx = newBallSpeed * Math.cos(angle);

            this.ball.dy = newBallSpeed * Math.sin(angle);
            this.ball.dx = (hitPaddle.paddleType === PaddlePosition.Right) ? -dx : dx;
        }
        else if (collisionPoint.paddleSide === RectangleSide.Top || collisionPoint.paddleSide === RectangleSide.Bottom)
        {
            this.ball.horizontalBounce();
        }
    }

    private updateBallPositionAndVelocityAfterMovingPaddleHit(collisionPoint: CollisionPoint)
    {
        if (collisionPoint === null)
        {
            return ;
        }

        this.ball.center = collisionPoint;

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

        if (collisionPoint.paddleSide === RectangleSide.Top)
        {
            this.ball.dy = -Math.abs(this.ball.dy) - BALL_INIT_SPEED;
        }
        else if (collisionPoint.paddleSide === RectangleSide.Bottom)
        {
            this.ball.dy = Math.abs(this.ball.dy) + BALL_INIT_SPEED;
        }
    }
}