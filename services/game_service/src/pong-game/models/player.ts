export interface GamePlayerState {
    username?: string;
    id?: number;
    score: number;
    paddleBounce: number;
}

export class Player {
    protected _paddleBounce: number;
    protected _score: number;
    protected _userId: number;
    protected _username: string | undefined;

    constructor(userId: number, username: string | undefined = undefined) {
        this._score = 0;
        this._paddleBounce = 0;
        this._userId = userId;
        this._username = username;
        this._paddleBounce = 0;
    }

    get score() {
        return this._score;
    }

    get userId(){
        return this._userId;
    }

    getUsername(): string | undefined {
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


    serialize(): GamePlayerState {
        return {
            id: this._userId,
            username: this._username,
            score: this._score,
            paddleBounce: this._paddleBounce,
        };
    }

}