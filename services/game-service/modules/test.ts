// // import { Paddle } from "./paddle_class.js";
// // import { Ball } from "./ball_class.js";
// // import { ballCollideWithPaddle, calculateCollisionPoint} from "./collisionManager.js";
// // import { Game } from "./game_class.js";


// // const game: Game = new Game('test1', 'test2');

// // // console.log(game.ball.center.x, game.ball.center.y);

// // game.ball.setPositions(4,50,1.99,50);
// // console.log(game.ball.prevCenter.x, game.ball.prevCenter.y);
// // console.log(game.ball.center.x, game.ball.center.y);
// // game.update()
// // console.log(game.ball.center.x, game.ball.center.y);

// // // console.log(ballCollideWithPaddle(paddle,ball));
// // // console.log(calculateCollisionPoint(paddle, ball));
// interface Point {
//     x: number;
//     y: number;
// }

// interface Ball {
//     center: Point;
//     dx: number;
//     dy: number;
//     collision: boolean;
// }

// interface Paddle {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
// }

// const BALL_SEMIDIAMETER = 10;

// class CollisionVisualizer {
//     private canvas: HTMLCanvasElement;
//     private ctx: CanvasRenderingContext2D;
//     private paddle: Paddle;
//     private ball: Ball;
//     private mousePos: Point;
//     private previousClick: Point | null = null;

//     constructor() {
//         this.canvas = document.createElement('canvas');
//         this.canvas.width = 800;
//         this.canvas.height = 600;
//         this.ctx = this.canvas.getContext('2d')!;
//         document.body.appendChild(this.canvas);

//         this.paddle = {
//             x: 350,
//             y: 250,
//             width: 100,
//             height: 20
//         };

//         this.ball = {
//             center: { x: 0, y: 0 },
//             dx: 0,
//             dy: 0,
//             collision: false
//         };

//         this.mousePos = { x: 0, y: 0 };

//         this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
//         this.canvas.addEventListener('click', this.handleClick.bind(this));
        
//         this.animate();
//     }

//     private handleMouseMove(event: MouseEvent) {
//         const rect = this.canvas.getBoundingClientRect();
//         this.mousePos.x = event.clientX - rect.left;
//         this.mousePos.y = event.clientY - rect.top;
//     }

//     private handleClick(event: MouseEvent) {
//         const rect = this.canvas.getBoundingClientRect();
//         this.previousClick = { ...this.ball.center };
//         this.ball.center.x = event.clientX - rect.left;
//         this.ball.center.y = event.clientY - rect.top;
//         this.ball.collision = false;
        
//         this.ball.dx = this.mousePos.x - this.ball.center.x;
//         this.ball.dy = this.mousePos.y - this.ball.center.y;
//     }

//     private ballCollideWithPaddle(paddle: Paddle, ball: Ball): boolean {
//         if (!this.previousClick) return false;
        
//         const lineStart = this.mousePos;
//         const lineEnd = ball.center;

//         const left = paddle.x;
//         const right = paddle.x + paddle.width;
//         const top = paddle.y;
//         const bottom = paddle.y + paddle.height;

//         return this.lineIntersectsRect(lineStart, lineEnd, left, top, right, bottom);
//     }

//     private lineIntersectsRect(p1: Point, p2: Point, left: number, top: number, right: number, bottom: number): boolean {
//         const lines = [
//             { x1: left, y1: top, x2: right, y2: top },
//             { x1: right, y1: top, x2: right, y2: bottom },
//             { x1: right, y1: bottom, x2: left, y2: bottom },
//             { x1: left, y1: bottom, x2: left, y2: top }
//         ];

//         for (const line of lines) {
//             if (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, line.x1, line.y1, line.x2, line.y2)) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     private linesIntersect(x1: number, y1: number, x2: number, y2: number, 
//                          x3: number, y3: number, x4: number, y4: number): boolean {
//         const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
//         if (denominator === 0) return false;

//         const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
//         const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

//         return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
//     }

//     private calculateCollisionPoint(paddle: Paddle, ball: Ball): Point {
//         const t = (paddle.y - this.mousePos.y) / (ball.center.y - this.mousePos.y);
//         const x = this.mousePos.x + t * (ball.center.x - this.mousePos.x);
//         return { x, y: paddle.y };
//     }

//     // Your collision handling function integrated here
//     private handleCollision(): Point | null {
//         let collisionPoint: Point | null = null;
//         let paddle: Paddle | null = null;
        
//         if (this.ballCollideWithPaddle(this.paddle, this.ball)) {
//             this.ball.collision = true;
//             collisionPoint = this.calculateCollisionPoint(this.paddle, this.ball);
//             paddle = this.paddle;
//         }
        
//         if (collisionPoint != null && paddle != null) {
//             const dx = this.ball.dx;
//             const dy = this.ball.dy;

//             const magnitude = Math.sqrt(dx * dx + dy * dy);

//             const nx = dx / magnitude;
//             const ny = dy / magnitude;

//             this.ball.center.x = collisionPoint.x - (BALL_SEMIDIAMETER + 0.01) * nx;
//             this.ball.center.y = collisionPoint.y - (BALL_SEMIDIAMETER + 0.01) * ny;

//             return { x: this.ball.center.x, y: this.ball.center.y };
//         }
//         return null;
//     }

//     private animate() {
//         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//         this.ctx.fillStyle = 'white';
//         this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

//         if (this.previousClick) {
//             this.ctx.beginPath();
//             this.ctx.arc(this.ball.center.x, this.ball.center.y, BALL_SEMIDIAMETER, 0, Math.PI * 2);
//             this.ctx.fillStyle = 'red';
//             this.ctx.fill();

//             this.ctx.beginPath();
//             this.ctx.moveTo(this.mousePos.x, this.mousePos.y);
//             this.ctx.lineTo(this.ball.center.x, this.ball.center.y);
//             this.ctx.strokeStyle = 'white';
//             this.ctx.stroke();

//             const reflectedPos = this.handleCollision();
//             if (reflectedPos) {
//                 this.ctx.beginPath();
//                 this.ctx.arc(reflectedPos.x, reflectedPos.y, BALL_SEMIDIAMETER, 0, Math.PI * 2);
//                 this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
//                 this.ctx.fill();
//             }
//         }

//         this.ctx.beginPath();
//         this.ctx.arc(this.mousePos.x, this.mousePos.y, BALL_SEMIDIAMETER, 0, Math.PI * 2);
//         this.ctx.fillStyle = 'blue';
//         this.ctx.fill();

//         requestAnimationFrame(this.animate.bind(this));
//     }
// }

// new CollisionVisualizer();