import {
    BALL_SEMIDIAMETER,
    PADDLE_HEIGHT,
    PADDLE_INIT_POSITION,
    PADDLE_MOVE_STEP,
    PADDLE_WIDTH
} from '../types/game-constants.js';



import {PaddlePosition as PaddleType, RectangleSide, PaddleState} from "../types/paddle.js";
import {Point} from "../types/point.js";

export class Edge{
    start: Point;
    end: Point;

    constructor( start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }

    pointDistance(pointToMeasure: Point): number {
        // Vector from p1 to p2
        const dx = this.end.x - this.start.x;
        const dy = this.end.y - this.start.y;
        const lenSquared = dx * dx + dy * dy;

        // If p1 and p2 are the same point, return distance to p1
        if (lenSquared === 0) {
            const distX = pointToMeasure.x - this.start.x;
            const distY = pointToMeasure.y - this.start.y;
            return Math.sqrt(distX * distX + distY * distY);
        }

        // Project p onto the line, clamping t to [0, 1] for segment bounds
        let t = ((pointToMeasure.x - this.start.x) * dx + (pointToMeasure.y - this.start.y) * dy) / lenSquared;
        t = Math.max(0, Math.min(1, t)); // Clamp to segment

        // Find the closest point on the segment
        const closest = {
            x: this.start.x + t * dx,
            y: this.start.y + t * dy
        };

        // Calculate Euclidean distance from p to the closest point
        const distX = pointToMeasure.x - closest.x;
        const distY = pointToMeasure.y - closest.y;
        return Math.sqrt(distX * distX + distY * distY);
    }

    isPointAbove(pointToTest: Point): boolean {
        // Calculate the signed distance
        const value = (this.end.x - this.start.x) * (pointToTest.y - this.start.y) - (this.end.y - this.start.y) * (pointToTest.x - this.start.x);

        return value > 0;
    }
}

export class RectangleEdge extends Edge{
    constructor(
        start: Point,
        end: Point,
        public side: RectangleSide
    )
    {super(start, end)}
}

export class Rectangle {
    constructor(
        public topLeft: Point,
        public topRight: Point,
        public bottomRight: Point,
        public bottomLeft: Point
    ) {}

    toArray(): Point[] {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
    }

    toEdges(): RectangleEdge[] {
        return [new RectangleEdge(this.topLeft, this.topRight, RectangleSide.Top),
            new RectangleEdge(this.topRight, this.bottomRight, RectangleSide.Right),
            new RectangleEdge(this.bottomRight, this.bottomLeft, RectangleSide.Bottom),
            new RectangleEdge(this.bottomLeft, this.topLeft, RectangleSide.Left)
        ]
    }
}

class PaddleGeometry{
    readonly #width: number;
    readonly #height: number;
    #position: Point;
    #prevPosition: Point;

    constructor(width: number, height: number, xCenter: number, yCenter:number) {
        this.#width = width;
        this.#height = height;
        this.#position = {x: xCenter, y: yCenter};
        this.#prevPosition = {x: xCenter, y: yCenter};
        console.log("PADDLE GEOMETRY X = ", xCenter);
    }

    getRectangle(): Rectangle {
        const halfWidth = this.#width / 2;
        const halfHeight = this.#height / 2;
        return new Rectangle(
            { x: this.#position.x - halfWidth, y: this.#position.y - halfHeight },
            { x: this.#position.x + halfWidth, y: this.#position.y - halfHeight },
            { x: this.#position.x + halfWidth, y: this.#position.y + halfHeight },
            { x: this.#position.x - halfWidth, y: this.#position.y + halfHeight }
        );
    }

    getPrevRectangle(): Rectangle {
        const halfWidth = this.#width / 2;
        const halfHeight = this.#height / 2;
        return new Rectangle(
            { x: this.#prevPosition.x - halfWidth, y: this.#prevPosition.y - halfHeight },
            { x: this.#prevPosition.x + halfWidth, y: this.#prevPosition.y - halfHeight },
            { x: this.#prevPosition.x + halfWidth, y: this.#prevPosition.y + halfHeight },
            { x: this.#prevPosition.x - halfWidth, y: this.#prevPosition.y + halfHeight }
        );
    }

    getCollisionBox(ballRadius: number): Rectangle {
        const rect = this.getRectangle();
        return new Rectangle(
            { x: rect.topLeft.x - ballRadius, y: rect.topLeft.y - ballRadius },
            { x: rect.topRight.x + ballRadius, y: rect.topRight.y - ballRadius },
            { x: rect.bottomRight.x + ballRadius, y: rect.bottomRight.y + ballRadius },
            { x: rect.bottomLeft.x - ballRadius, y: rect.bottomLeft.y + ballRadius }
        );
    }

    getPrevCollisionBox(ballRadius: number): Rectangle {
        const prevRect = this.getPrevRectangle();
        return new Rectangle(
            { x: prevRect.topLeft.x - ballRadius, y: prevRect.topLeft.y - ballRadius },
            { x: prevRect.topRight.x + ballRadius, y: prevRect.topRight.y - ballRadius },
            { x: prevRect.bottomRight.x + ballRadius, y: prevRect.bottomRight.y + ballRadius },
            { x: prevRect.bottomLeft.x - ballRadius, y: prevRect.bottomLeft.y + ballRadius }
        );
    }

    moveBy(dy: number): void {
        this.#position.y += dy;
    }

    updatePrevPosition(): void {
        this.#prevPosition = { ...this.#position };
    }

    setPosition(yCenter: number): void {
        this.#position.y = yCenter;
    }

    getCenterY(): number {
        return this.#position.y;
    }

    getYOfTopEdge(): number {
        return this.#position.y - this.#height / 2;
    }

    getYOfBottomEdge(): number {
        return this.#position.y + this.#height / 2;
    }

    isPointInsideVerticalEdges(point: Point): boolean {
        const rect = this.getCollisionBox(BALL_SEMIDIAMETER); // TODO: hardcoded ball_semidiameter
        return (
            point.x >= rect.topLeft.x &&
            point.x <= rect.topRight.x
        );
    }

    isPointInside(point: Point): boolean {
        const rect = this.getCollisionBox(BALL_SEMIDIAMETER); // TODO: hardcoded ball_semidiameter
        return (
            point.x >= rect.topLeft.x &&
            point.x <= rect.topRight.x &&
            point.y >= rect.topLeft.y &&
            point.y <= rect.bottomLeft.y
        );
    }
}

export class Paddle extends PaddleGeometry{
    paddleType: PaddleType
    direction: number;

	constructor(paddleType: PaddleType) {
        const x = paddleType === PaddleType.Left ? PADDLE_WIDTH / 2 : 100 - PADDLE_WIDTH / 2;
        super(PADDLE_WIDTH, PADDLE_HEIGHT, x, PADDLE_INIT_POSITION);
        this.paddleType = paddleType;
        this.direction = 0;
    }

    isAtTopEdge(): boolean {
        return this.getYOfTopEdge() < 0;
    }

    isAtBottomEdge(): boolean {
        return this.getYOfBottomEdge() > 100;
    }

    setMove(direction: number): void
    {
        this.direction = Math.sign(direction);
    }

    update(): void {
        this.updatePrevPosition();

        this.moveBy(this.direction * PADDLE_MOVE_STEP)

        if (this.isAtTopEdge()) {
            this.setPosition(0 + PADDLE_HEIGHT / 2)
        }
        else if (this.isAtBottomEdge()) {
            this.setPosition(100 - PADDLE_HEIGHT / 2)
        }
    }

    serialize(): PaddleState {
        return {
            yCenter: this.getCenterY(),
            height: PADDLE_HEIGHT,
            width: PADDLE_WIDTH
        };
    }
}