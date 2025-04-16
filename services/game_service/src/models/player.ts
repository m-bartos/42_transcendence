import {PaddleState} from "../types/paddle.js";

export interface PlayerState {
    username?: string;
    playerId?: string;
    score: number;
    paddleBounce: number;
}

export abstract class Player {
    protected _paddleBounce: number;
    protected _score: number;
    protected _username: string;

    protected constructor(username: string) {
        this._score = 0;
        this._paddleBounce = 0;
        this._username = username;
    }

    get score() {
        return this._score;
    }

    getUsername(): string {
        return this._username;
    }

    setUsername(username: string) {
        this._username = username;
    }

    addScore() {
        this._score += 1;
    }

    addPaddleBounce() {
        this._paddleBounce += 1;
    }

    abstract serialize(): PlayerState;

}

export class SplitKeyboardPlayer extends Player {

    constructor(username: string) {
        super(username);
    }

    serialize(): PlayerState {
        const base = {
            username: this._username,
            score: this._score,
            paddleBounce: this._paddleBounce,
        }
        return base;
    }
}

export class MultiplayerPlayer extends Player {
    _playerId: string;

    constructor(playerId: string, username: string) {
        super(username);
        this._playerId = playerId;
    }

    get playerId(): string {
        return this._playerId;
    }

    serialize(): PlayerState {
        const base = {
            playerId: this._playerId,
            username: this._username,
            score: this._score,
            paddleBounce: this._paddleBounce,
        }
        return base;
    }

}