import {
    GameState
} from "../pong-game/types/game.js";
import {WsDataCountdown, WsDataEnded, WsDataLive, WsGame, WsGameDataProperties, WsEvent} from "../types/ws-server-messages.js";

export type WsGameMessageCreator = {
    createGamePropertiesMessage: typeof createGamePropertiesMessage;
    createGameLiveMessage: typeof createGameLiveMessage;
    createGameCountdownMessage: typeof createGameCountdownMessage;
    createGameEndedMessage: typeof createGameEndedMessage;
};

export const WsGameMessageCreator: WsGameMessageCreator = {
    createGamePropertiesMessage: createGamePropertiesMessage,
    createGameLiveMessage: createGameLiveMessage,
    createGameCountdownMessage: createGameCountdownMessage,
    createGameEndedMessage: createGameEndedMessage,
}

function createGameEndedMessage(state: GameState): WsGame {
    let winnerUsername: string | undefined = undefined;

    if (state.winnerId) {
        const winner = state.players.find(player => player.id === state.winnerId);
        if (winner) {
            winnerUsername = winner.username;
        } else {
            winnerUsername = '';
            console.error('Invalid winnerId: No matching player found');
        }
    } else {
        winnerUsername = '';
        console.warn('No winnerId provided');
    }

    return {
        event: WsEvent.Ended,
        timestamp: Date.now(),
        data: {
            paddles: state.paddles,
            players: state.players,
            ball: state.ball,
            // isBounce: ???,
            // isScore: ???,
            endCondition: state.endCondition,
            winnerId: state.winnerId,
            winnerUsername: winnerUsername,
            duration: state.duration,
        } as WsDataEnded,
    }
}

function createGameCountdownMessage(state: GameState): WsGame {
    return {
        event: WsEvent.Countdown,
        timestamp: Date.now(),
        data: {
            paddles: state.paddles,
            players: state.players,
            ball: state.ball,
            countdown: state.countdown,
        } as WsDataCountdown,
    }
}

function createGameLiveMessage(state: GameState): WsGame {
    return {
        event: WsEvent.Live,
        timestamp: Date.now(),
        data: {
            paddles: state.paddles,
            players: state.players,
            ball: state.ball,
        } as WsDataLive,
    }
}

function createGamePropertiesMessage(state: GameState): WsGame {
    return {
        event: WsEvent.GameProperties,
        timestamp: Date.now(),
        data: {
            canvas: state.canvas
        } as WsGameDataProperties
    }
}
