import {EventEmitter} from "node:events";
import {GameType} from "../types/game.js";
import {GameEventsPublisher} from "../plugins/rabbitMQ-plugin.js";
import {Game, MultiplayerGame, SplitKeyboardGame} from "./game.js";
import {MultiplayerPlayer, Player, SplitKeyboardPlayer} from "./player.js";
import {PhysicsEngine} from "./physics-engine.js";
import {MultiplayerConnectionHandler, SingleBrowserConnectionHandler} from "./game-connection-handler.js";

export interface FactoryConfig {
    gameType: GameType;
    playerOneSessionId: string;
    playerOneUserId: string;
    playerOneUsername: string;
    playerTwoSessionId?: string;
    playerTwoUserId?: string;
    playerTwoUsername: string;
    gameEventPublisher: GameEventsPublisher;
    gameEventEmitter?: EventEmitter;
}

export class GameModeFactory {
    static createGame(config: FactoryConfig): Game {
        const gameEventEmitter = config.gameEventEmitter ?? new EventEmitter();
        const gameEventPublisher = config.gameEventPublisher;

        switch (config.gameType) {
            case GameType.Multiplayer: {
                if (!config.playerTwoSessionId || !config.playerTwoUserId) {
                    throw new Error('Multiplayer game requires two players');
                }
                const playerOne = new MultiplayerPlayer(config.playerOneSessionId, config.playerOneUsername);
                const playerTwo = new MultiplayerPlayer(config.playerTwoSessionId, config.playerTwoUsername);
                const physicsEngine = new PhysicsEngine(gameEventEmitter);
                const connectionHandler = new MultiplayerConnectionHandler(gameEventEmitter, config.playerOneSessionId, config.playerTwoSessionId);
                return new MultiplayerGame(
                    GameType.Multiplayer,
                    playerOne,
                    playerTwo,
                    gameEventPublisher,
                    gameEventEmitter,
                    physicsEngine,
                    connectionHandler,
                );
            }
            case GameType.SplitKeyboard: {
                const playerOne = new SplitKeyboardPlayer(config.playerOneUsername);
                const playerTwo = new SplitKeyboardPlayer(config.playerTwoUsername);
                const physicsEngine = new PhysicsEngine(gameEventEmitter);
                const connectionHandler = new SingleBrowserConnectionHandler(gameEventEmitter, config.playerOneSessionId);
                return new SplitKeyboardGame(
                    GameType.SplitKeyboard,
                    playerOne,
                    playerTwo,
                    gameEventPublisher,
                    gameEventEmitter,
                    physicsEngine,
                    connectionHandler,
                );
            }
            default:
                throw new Error(`Unsupported game type: ${config.gameType}`);
        }
    }
}