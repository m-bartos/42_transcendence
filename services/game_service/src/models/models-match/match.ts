import { MatchPlayer } from './matchPlayer.js';
import { MatchmakingState, MatchStatus } from '../../types/types-match/matchmaking.js';
import { MATCH_TIMEOUT } from '../../types/types-match/matchmaking-constants.js';
import {MatchWebSocket} from "../../types/types-match/websocket.js";

export class Match {
    // readonly id: string;
    readonly gameId: string;
    private firstPlayer: MatchPlayer;
    private secondPlayer: MatchPlayer;
    readonly created: Date;

    constructor(playerOne: MatchPlayer, playerTwo: MatchPlayer, gameId: string) {
		// this.id = crypto.randomUUID();
        this.gameId = gameId;
        this.firstPlayer = playerOne;
        this.secondPlayer = playerTwo;
        this.created = new Date(Date.now());
    }

    getMatchFoundMessage(): MatchmakingState {
        return {
            status: 'found',
            gameId: this.gameId
        };
    }

    broadcastMatchState(): void {
        const message = JSON.stringify(this.getMatchFoundMessage());
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

    getFirstPlayer(): MatchPlayer {
        return this.firstPlayer;
    }

    getSecondPlayer(): MatchPlayer {
        return this.secondPlayer;
    }
}