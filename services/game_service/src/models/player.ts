
export class Player {
    private _playerId: number;
    private _playerSessionId: string;

    constructor( playerSessionId: string, playerId: number
    ) {
        this._playerId = playerId;
        this._playerSessionId = playerSessionId;
    }

    get playerId(): number {
        return this._playerId;
    }

    get sessionId(): string {
        return this._playerSessionId;
    }

    // won't be needed
    getUsername(): string {
            return "test2";
    }
}