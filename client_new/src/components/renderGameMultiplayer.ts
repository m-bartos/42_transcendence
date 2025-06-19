import Navigo from "navigo";
import {WebSocketHandler} from "../api/webSocketHandler";
import {home_page_url} from "../config/api_url_config";
import {
    actionButtonId,
    gameCanvasId,
    gameOverlayId,
    gameTimerId,
    GameType,
    renderHtmlGameLayout
} from "./utils/game/renderHtmlGameLayout";
import {renderGameCanvas} from "./utils/game/renderGameCanvas";
import {sendPaddleMovements} from "../utils/game/sendPaddleMovements";
import {sendPaddleTouchMovements} from "../utils/game/sendPaddleMovements";
import {updateAvatar, updateScore, updateUsername} from "../utils/game/updateGameDomData";
import {setHtmlParentProps} from "./utils/game/setHtmlParrentProps";
import {sendOpponentFound} from "../utils/game/sendOpponentFound";
import {
    MultiplayerGameEvent,
    WsDataCountdown,
    WsDataLive,
    WsDataOpponentFound,
    WsGameDataProperties
} from "../types/multiplayer-game";
import {recordGameTime} from "../utils/game/updateGameTimer";
import {GameTimer} from "../utils/game/gameTimer";
import {updateGameStatus} from "../utils/game/updateGameStatus";
import {updateGameOverlay} from "../utils/game/updateGameOverlay";
import {handleClicksOnOverlay} from "../utils/game/handleClicksOnOverlay";
import {sendLeaveGame, sendLeaveMatchmaking} from "../utils/game/sendLeaveMatchmaking";

function leaveMatchmaking(router: Navigo, gameDataFromServer: WebSocketHandler) {
    sendLeaveMatchmaking(gameDataFromServer);
    router.navigate(home_page_url);
}


export function renderGameMultiplayer(router: Navigo, gameDataFromServer: WebSocketHandler) {
    document.title = "Pong - Multiplayer Game";
    const app = document.getElementById('app') as HTMLDivElement;
    //const token = localStorage.getItem('jwt')!;
    
    try {
        // Set parent container to host the game
        setHtmlParentProps(app);
        // Create a new event Target object
        //const gameDataFromServer = new WebSocketHandler(generateGameWebsocketUrl(token));
        // Render HTML skeleton
        renderHtmlGameLayout(app, GameType.Multiplayer);
        // Action button
        const actionButton = document.getElementById(actionButtonId) as HTMLButtonElement;
        // Game Ended overlay
        const gameOverlay = document.getElementById(gameOverlayId) as HTMLDivElement;


        // Create canvas element and append it to the wrapper
        const canvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
        if (!canvasWrapper) {
            console.error('Canvas wrapper not found');
            return;
        }
        const canvas = document.createElement('canvas');

        canvasWrapper.append(canvas)

        // Render canvas
        //const canvas = document.getElementById(gameCanvasId) as HTMLCanvasElement;
        renderGameCanvas(GameType.Multiplayer, canvas);
        // Set game timer
        const gameTimer = document.getElementById(gameTimerId) as HTMLDivElement;
        const timer = new GameTimer(gameTimer);
        const leaveMatchmakingHandler = () => leaveMatchmaking(router, gameDataFromServer);
        // Start listening for game events
        actionButton.addEventListener('click', leaveMatchmakingHandler);
        gameDataFromServer.addEventListener('gameData', (e:Event)=> {
            const gameData = (e as CustomEvent).detail;
            // console.log(gameData);
            if (gameData.event === MultiplayerGameEvent.Searching)
            {
                // do something
                updateGameStatus("Searching...");
            }
            else if (gameData.event === MultiplayerGameEvent.OpponentFound)
            {
                updateGameStatus('Opponent found');
                const data = gameData.data as WsDataOpponentFound;
                // send opponentFound response to server
                updateUsername(data.players);
                sendOpponentFound(gameDataFromServer, data);
                updateAvatar(data);
            }
            else if (gameData.event === MultiplayerGameEvent.GameProperties)
            {
                const data = gameData.data as WsGameDataProperties;
                renderGameCanvas(GameType.Multiplayer, canvas, undefined, data);
                actionButton.innerHTML = "ABORT GAME";
                // TODO: delete previous listeners for matchmaking
                actionButton.removeEventListener('click', leaveMatchmakingHandler);
                actionButton.addEventListener('click', () => {
                    sendLeaveGame(gameDataFromServer);
                });
            }
            else if (gameData.event === MultiplayerGameEvent.Countdown)
            {
                const data = gameData.data as WsDataCountdown;
                updateGameStatus(data.countdown.toString());
                // updateUsername(data.players);
            }
            else if (gameData.event === MultiplayerGameEvent.Live)
            {
                const data = gameData.data as WsDataLive;
                updateGameStatus('Live');
                updateScore(data);
                renderGameCanvas(GameType.Multiplayer, canvas, data);
                recordGameTime('live', timer);

            }
            else if (gameData.event === MultiplayerGameEvent.Ended)
            {
                actionButton.classList.add('hidden');
                updateGameStatus("Game Ended");
                recordGameTime('ended', timer);
                updateGameOverlay(gameData);
                handleClicksOnOverlay(router, GameType.Multiplayer);
            }
        });

        // register key movements and send data to the server
        sendPaddleMovements(gameDataFromServer);
        sendPaddleTouchMovements(gameDataFromServer);
        // register resize listener and resize canvas
        window.addEventListener("resize", () => {
            renderGameCanvas(GameType.Multiplayer, canvas);
        });


        // console.log("Canvas dimensions: ", canvas.width, canvas.height);
        // console.log("Viewport dimensions: ", window.innerWidth, window.innerHeight);
    }
    catch (error) {
        throw error;
    }
}

