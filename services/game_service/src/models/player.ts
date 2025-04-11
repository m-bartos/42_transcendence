export class Player {
    private _playerId: string;
    private _playerSessionId: string;
    private _score: number;


    constructor( playerSessionId: string, userId: string
    ) {
        this._playerId = userId;
        this._playerSessionId = playerSessionId;
        this._score = 0;
    }

    get playerId(): string {
        return this._playerId;
    }

    get sessionId(): string {
        return this._playerSessionId;
    }

    get score(): number {
        return this._score;
    }

    addScore() {
        this._score += 1;
    }

    // won't be needed
    getUsername(): string {
            return "test2";
    }
}