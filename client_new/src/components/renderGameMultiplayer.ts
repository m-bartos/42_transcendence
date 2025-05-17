import { WebSocketHandler } from "../api/webSocketHandler";
import { generateGameWebsocketUrl, generateStaticDataUrl } from "../config/api_url_config";
import {gameCanvasId, gameTimerId, renderHtmlGameLayout} from "./utils/game/renderHtmlGameLayout";
import { renderGameCanvas } from "./utils/game/renderGameCanvas";
import { sendPaddleMovements } from "../utils/game/sendPaddleMovements";
import {updateScore, updateUsername, updateLoggedInUserInfo /*, updateAvatarLink */} from "../utils/game/updateGameDomData";
import {setHtmlParentProps} from "./utils/game/setHtmlParrentProps";
import {sendOpponentFound} from "../utils/game/sendOpponentFound";
import { GameStatus, WsDataLive, WsDataOpponentFound, WsGameDataProperties } from "../types/game";
import { recordGameTime} from "../utils/game/updateGameTimer";
import {GameTimer} from "../utils/game/gameTimer";

export function renderGameMultiplayer() {
    const app = document.getElementById('app') as HTMLDivElement;
    const token = localStorage.getItem('jwt')!;

    try {
        // Set parent container to host the game
        setHtmlParentProps(app);
        // Create a new event Target object
        const gameDataFromServer = new WebSocketHandler(generateGameWebsocketUrl(token));
        // Render HTML skeleton
        renderHtmlGameLayout(app);
        // Render canvas
        const canvas = document.getElementById(gameCanvasId) as HTMLCanvasElement;
        renderGameCanvas(canvas);
        // Start listening for game events
        const timerDiv = document.getElementById(gameTimerId) as HTMLDivElement;
        const timer = new GameTimer(timerDiv);
        gameDataFromServer.addEventListener('gameData', (e:Event)=> {
            const gameData = (e as CustomEvent).detail;
            console.log(gameData);
            if (gameData.status === GameStatus.Searching)
            {
                // do something
            }
            else if (gameData.status === GameStatus.OpponentFound)
            {
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
                const data = gameData.data as WsDataLive;
                updateUsername(data);
                // do something else
            }
            else if (gameData.status === GameStatus.Live)
            {
                const data = gameData.data as WsDataLive;
                updateScore(data);
                renderGameCanvas(canvas, data);
                recordGameTime('live', timer);

            }
            else if (gameData.status === GameStatus.Ended)
            {
                console.log(gameData);
                recordGameTime('ended', timer);
            }

        });

        // Todo implement overlay and timer and leave and abort button
        const overlay = document.getElementById('gameOverlay') as HTMLDivElement;
        const timerEl = document.getElementById('timer')!;

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

