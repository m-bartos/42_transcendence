import { BallState } from '../types/game.js';

import { BALL_DIAMETER, BALL_SPEED, BALL_MAX_SPEED, PADDLE_HEIGHT, PADDLE_WIDTH } from '../types/constants.js';


export class Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    diameter: number;
    speed: number;
    prevX: number;  // Previous x position
    prevY: number;  // Previous y position

    constructor() {
        this.x = 50;
        this.y = 50;
        this.dx = 0;
        this.dy = 0;
        this.diameter = BALL_DIAMETER;
        this.speed = BALL_SPEED;
        this.prevX = 50;
        this.prevY = 50;
    }

    // start(): void {
    //     // Random initial direction
    //     const angle = (Math.random() * Math.PI / 4) + Math.PI / 8; // Angle between PI/8 and 3PI/8
    //     const direction = Math.random() < 0.5 ? 1 : -1; // Random initial direction (left or right)
        
    //     // Set velocity based on angle and speed
    //     this.dx = this.speed * direction * Math.cos(angle);
    //     this.dy = this.speed * Math.sin(angle);
    // }

	// TESTING 
	start(): void {
        // Random initial direction
        const angle = 0;
        const direction = -1;
        
        // Set velocity based on angle and speed
        this.dx = this.speed * direction * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
    }

    update(): void {
        // Store previous position
        this.prevX = this.x;
        this.prevY = this.y;

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off top and bottom walls (0-100 space)
        if (this.y <= (0 + BALL_DIAMETER/2) || this.y >= (100 - BALL_DIAMETER/2) ) {
            this.dy = -this.dy;
            this.y = Math.max(0 + BALL_DIAMETER/2, Math.min(100 - BALL_DIAMETER/2, this.y));
        }
    }

    checkPaddleCollision(paddleX: number, paddleY: number, isLeftPaddle: boolean): boolean {
        const paddleLeft = paddleX;
        const paddleRight = paddleX + PADDLE_WIDTH;
        const paddleTop = paddleY - PADDLE_HEIGHT/2;
        const paddleBottom = paddleY + PADDLE_HEIGHT/2;

        // Line segment representing ball's movement this frame
        const ballStartX = this.prevX;
        const ballStartY = this.prevY;
        const ballEndX = this.x;
        const ballEndY = this.y;

        // Check if ball's path intersects with paddle
        // Using line segment intersection with rectangle
        if (this.lineIntersectsRectangle(
            ballStartX, ballStartY,
            ballEndX, ballEndY,
            paddleLeft - this.diameter / 2, paddleTop - this.diameter / 2,
            paddleRight + this.diameter / 2, paddleBottom + this.diameter / 2
        )) {
            // Find approximate point of collision using binary search
            let t = this.findCollisionTime(
                ballStartX, ballStartY,
                ballEndX, ballEndY,
                paddleLeft - this.diameter, paddleTop - this.diameter,
                paddleRight + this.diameter, paddleBottom + this.diameter
            );

            // Calculate collision point
            const collisionX = ballStartX + (ballEndX - ballStartX) * t;
            const collisionY = ballStartY + (ballEndY - ballStartY) * t;

            // Calculate relative impact point
            const relativeIntersectY = (paddleY + (PADDLE_HEIGHT / 2)) - collisionY;
            const normalizedRelativeIntersectY = -(relativeIntersectY / (PADDLE_HEIGHT / 2));
            
            // Calculate new angle (maximum 75 degrees)
            const maxBounceAngle = Math.PI / 3;
            const bounceAngle = normalizedRelativeIntersectY * maxBounceAngle;
            
            // Set new velocity
            this.dx = isLeftPaddle ? 
                Math.abs(this.speed * Math.cos(bounceAngle)) : 
                -Math.abs(this.speed * Math.cos(bounceAngle));
            this.dy = -this.speed * Math.sin(bounceAngle);
            
            // Move ball to collision point
            this.x = collisionX;
            this.y = collisionY;
            
            // Slightly increase speed
            this.speed *= 1.05;
            if (this.speed > BALL_MAX_SPEED)
				this.speed = BALL_MAX_SPEED;

            return true;
        }
        return false;
    }

    private lineIntersectsRectangle(
        lineStartX: number, lineStartY: number,
        lineEndX: number, lineEndY: number,
        rectLeft: number, rectTop: number,
        rectRight: number, rectBottom: number
    ): boolean {
        // Check if line is completely to one side of rectangle
        if (Math.max(lineStartX, lineEndX) < rectLeft) return false;
        if (Math.min(lineStartX, lineEndX) > rectRight) return false;
        if (Math.max(lineStartY, lineEndY) < rectTop) return false;
        if (Math.min(lineStartY, lineEndY) > rectBottom) return false;

        // Check if either endpoint is inside rectangle
        if (this.pointInRect(lineStartX, lineStartY, rectLeft, rectTop, rectRight, rectBottom)) return true;
        if (this.pointInRect(lineEndX, lineEndY, rectLeft, rectTop, rectRight, rectBottom)) return true;

        // Check intersection with each edge of rectangle
        const edges = [
            [rectLeft, rectTop, rectRight, rectTop],       // Top edge
            [rectLeft, rectBottom, rectRight, rectBottom], // Bottom edge
            [rectLeft, rectTop, rectLeft, rectBottom],     // Left edge
            [rectRight, rectTop, rectRight, rectBottom]    // Right edge
        ];

        return edges.some(([x1, y1, x2, y2]) => 
            this.lineSegmentsIntersect(
                lineStartX, lineStartY, lineEndX, lineEndY,
                x1, y1, x2, y2
            )
        );
    }

    private findCollisionTime(
        lineStartX: number, lineStartY: number,
        lineEndX: number, lineEndY: number,
        rectLeft: number, rectTop: number,
        rectRight: number, rectBottom: number
    ): number {
        // Binary search to find collision time
        let left = 0;
        let right = 1;
        const ITERATIONS = 6; // Precision of binary search

        for (let i = 0; i < ITERATIONS; i++) {
            const mid = (left + right) / 2;
            const testX = lineStartX + (lineEndX - lineStartX) * mid;
            const testY = lineStartY + (lineEndY - lineStartY) * mid;

            if (this.pointInRect(testX, testY, rectLeft, rectTop, rectRight, rectBottom)) {
                right = mid;
            } else {
                left = mid;
            }
        }

        return left;
    }

    private pointInRect(
        x: number, y: number,
        rectLeft: number, rectTop: number,
        rectRight: number, rectBottom: number
    ): boolean {
        return x >= rectLeft && x <= rectRight && y >= rectTop && y <= rectBottom;
    }

    private lineSegmentsIntersect(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): boolean {
        const denominator = ((x2 - x1) * (y4 - y3)) - ((y2 - y1) * (x4 - x3));
        if (denominator === 0) return false;

        const t = (((x3 - x1) * (y4 - y3)) - ((y3 - y1) * (x4 - x3))) / denominator;
        const u = (((x3 - x1) * (y2 - y1)) - ((y3 - y1) * (x2 - x1))) / denominator;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    reset(): void {
        this.x = 50;
        this.y = 50;
        this.prevX = 50;
        this.prevY = 50;
        this.dx = 0;
        this.dy = 0;
        this.speed = BALL_SPEED;
    }

    serialize(): BallState {
        return {
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy,
            size: this.diameter
        };
    }
}