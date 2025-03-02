import { Player } from '../modules/player_class.js';
import { MatchmakingState, MatchStatus, MatchWebSocket } from '../types/match.js';
import { MATCH_TIMEOUT } from '../types/constants.js';

export class Match {
    // readonly id: string;
    readonly gameId: string;
    private firstPlayer: Player;
    private secondPlayer: Player;
    readonly created: Date;

    constructor(playerOne: Player, playerTwo: Player, gameId: string) {
		// this.id = crypto.randomUUID();
        this.gameId = gameId;
        this.firstPlayer = playerOne;
        this.secondPlayer = playerTwo;
        this.created = new Date(Date.now());
    }

    getCurrentState(): MatchmakingState {
        return {
            gameId: this.gameId
        };
    }

    broadcastMatchState(): void {
        const message = JSON.stringify(this.getCurrentState());
        this.firstPlayer.sendMessage(message);
        this.secondPlayer.sendMessage(message);
    }

    shouldDelete(): boolean
    {

        const currentTime = new Date();
        const timeSinceCreated = currentTime.getTime() - this.created.getTime();
        if (timeSinceCreated > MATCH_TIMEOUT * 1000)
        {
            return true;
        }

        return false;
    }

    destroy(): void {
        this.firstPlayer.disconnect();
        this.secondPlayer.disconnect();
        this.firstPlayer = null as any;
        this.secondPlayer = null as any;
    }

    getFirstPlayer(): Player {
        return this.firstPlayer;
    }

    getSecondPlayer(): Player {
        return this.secondPlayer;
    }
}