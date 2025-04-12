import {Point} from "../types/point.js";
import {Rectangle} from "./rectangle.js";

export abstract class PaddleGeometry{
    readonly #width: number;
    readonly #height: number;
    #position: Point;
    #prevPosition: Point;

    constructor(width: number, height: number, xCenter: number, yCenter:number) {
        this.#width = width;
        this.#height = height;
        this.#position = {x: xCenter, y: yCenter};
        this.#prevPosition = {x: xCenter, y: yCenter};
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

    move(dy: number): void {
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
}
