import { WebSocket } from '@fastify/websocket';
export interface GameWebSocket extends WebSocket {
    gameId: string;
    playerId: string;
}

export  enum PaddleSide {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom'
}
export interface CollisionPoint extends Point{
    paddleSide: PaddleSide | null
}

export type GameStatus = 'pending' | 'live' | 'finished';

export enum PaddlePosition {
    Left = 'left', 
    Right = 'right'
}

export interface GameState {
    status: GameStatus;
    paddleOne: PaddleState;
    paddleTwo: PaddleState;
    ball: BallState;
    playerOneScore: number;
    playerTwoScore: number;
    timestamp: number;
}

export interface PaddleState {
    yCenter: number;
    height: number;
    width: number;
}

export interface BallState {
    x: number;
    y: number;
    semidiameter: number;
}
export interface CreateGameBody {
    playerOneId: string;
    playerTwoId: string;
}

export interface Point {
    x: number;
    y: number;
}