import {
    GameState,
    GameStatus
} from "../pong-game/types/game.js";
import {WsDataCountdown, WsDataEnded, WsDataLive, WsGame, WsGameDataProperties} from "../types/ws-server-messages.js";

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
        console.error('No winnerId provided');
    }

    return {
        event: GameStatus.Ended,
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
        event: GameStatus.Countdown,
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
        event: GameStatus.Live,
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
        event: GameStatus.GameProperties,
        timestamp: Date.now(),
        data: {
            canvas: state.canvas
        } as WsGameDataProperties
    }
}

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