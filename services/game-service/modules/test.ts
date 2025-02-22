import { Paddle } from "./paddle_class.js";
import { Ball } from "./ball_class.js";
import { ballCollideWithPaddle, calculateCollisionPoint} from "./collisionManager.js";
import { Game } from "./game_class.js";


const game: Game = new Game('test1', 'test2');

// console.log(game.ball.center.x, game.ball.center.y);

game.ball.setPositions(4,50,1.99,50);
console.log(game.ball.prevCenter.x, game.ball.prevCenter.y);
console.log(game.ball.center.x, game.ball.center.y);
game.update()
console.log(game.ball.center.x, game.ball.center.y);

// console.log(ballCollideWithPaddle(paddle,ball));
// console.log(calculateCollisionPoint(paddle, ball));
