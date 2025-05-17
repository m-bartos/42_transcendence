import Navigo from "navigo";
import { WebSocketHandler } from "../api/webSocketHandler";
import { generateGameWebsocketUrl } from "../config/api_url_config";
import { gameCanvasId, gameTimerId, actionButtonId, gameOverlayId, renderHtmlGameLayout } from "./utils/game/renderHtmlGameLayout";
import { renderGameCanvas } from "./utils/game/renderGameCanvas";
import { sendPaddleMovements } from "../utils/game/sendPaddleMovements";
import { updateScore, updateUsername } from "../utils/game/updateGameDomData";
import { setHtmlParentProps } from "./utils/game/setHtmlParrentProps";
import { sendOpponentFound } from "../utils/game/sendOpponentFound";
import { GameStatus, WsDataCountdown, WsDataLive, WsDataOpponentFound, WsGameDataProperties} from "../types/game";
import { recordGameTime } from "../utils/game/updateGameTimer";
import { GameTimer } from "../utils/game/gameTimer";
import { updateGameStatus } from "../utils/game/updateGameStatus";
import { updateGameOverlay } from "../utils/game/updateGameOverlay";
import { handleClicksOnOverlay } from "../utils/game/handleClicksOnOverlay";

export function renderGameMultiplayer(router: Navigo, gameDataFromServer: WebSocketHandler) {
    const app = document.getElementById('app') as HTMLDivElement;
    //const token = localStorage.getItem('jwt')!;

    try {
        // Set parent container to host the game
        setHtmlParentProps(app);
        // Create a new event Target object
        //const gameDataFromServer = new WebSocketHandler(generateGameWebsocketUrl(token));
        // Render HTML skeleton
        renderHtmlGameLayout(app);
        // Action button
        const actionButton = document.getElementById('actionButton') as HTMLButtonElement;
        // Game Ended overlay
        const gameOverlay = document.getElementById(gameOverlayId) as HTMLDivElement;
        // Render canvas
        const canvas = document.getElementById(gameCanvasId) as HTMLCanvasElement;
        renderGameCanvas(canvas);
        // Set game timer
        const gameTimer = document.getElementById(gameTimerId) as HTMLDivElement;
        const timer = new GameTimer(gameTimer);
        // Start listening for game events
        gameDataFromServer.addEventListener('gameData', (e:Event)=> {
            const gameData = (e as CustomEvent).detail;
            console.log(gameData);
            if (gameData.status === GameStatus.Searching)
            {
                // do something
                updateGameStatus("Searching...");
            }
            else if (gameData.status === GameStatus.OpponentFound)
            {
                actionButton.innerHTML = "ABORT GAME"
                updateGameStatus('Opponent found');
                const data = gameData.data as WsDataOpponentFound;
                // send opponentFound response to server
                sendOpponentFound(gameDataFromServer, data);
            }
            else if (gameData.status === GameStatus.GameProperties)
            {
                const data = gameData.data as WsGameDataProperties;
                renderGameCanvas(canvas, undefined, data);
            }
            else if (gameData.status === GameStatus.Countdown)
            {
                const data = gameData.data as WsDataCountdown;
                updateGameStatus(data.countdown.toString());
                updateUsername(data);
            }
            else if (gameData.status === GameStatus.Live)
            {
                const data = gameData.data as WsDataLive;
                updateGameStatus('Live');
                updateScore(data);
                renderGameCanvas(canvas, data);
                recordGameTime('live', timer);

            }
            else if (gameData.status === GameStatus.Ended)
            {
                actionButton.classList.add('hidden');
                updateGameStatus("Game Ended");
                recordGameTime('ended', timer);
                updateGameOverlay(gameData);
                handleClicksOnOverlay(router);
            }
        });

        // register key movements and send data to the server
        sendPaddleMovements(gameDataFromServer);
        // register resize listener and resize canvas
        window.addEventListener("resize", () => {
            renderGameCanvas(canvas);
        });


        console.log("Canvas dimensions: ", canvas.width, canvas.height);
        console.log("Viewport dimensions: ", window.innerWidth, window.innerHeight);
    }
    catch (error) {
        throw error;
    }
}

