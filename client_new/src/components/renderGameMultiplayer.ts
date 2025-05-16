import { WebSocketHandler } from "../api/webSocketHandler";
import { generateGameWebsocketUrl, generateStaticDataUrl } from "../config/api_url_config";
import { gameCanvasId, renderHtmlGameLayout} from "./utils/game/renderHtmlGameLayout";
import { renderGameCanvas } from "./utils/game/renderGameCanvas";
import { sendPaddleMovements } from "../utils/game/sendPaddleMovements";
import {updateScore, updateUsername, updateLoggedInUserInfo, updateAvatarLink} from "../utils/game/updateGameDomData";
import {setHtmlParentProps} from "./utils/game/setHtmlParrentProps";

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
        // Update logged in user DOM fields
        updateLoggedInUserInfo()
        // Start listening for game events
        gameDataFromServer.addEventListener('gameData', (e:Event)=> {
            const gameData = (e as CustomEvent).detail;
            console.log(gameData);
            if (gameData.status === 'searching')
            {
                // do something
                console.log(gameData);
            }
            else if (gameData.status === 'countdown')
            {
                updateUsername(gameData);
                updateAvatarLink(gameData);
                // do something else
            }
            else if (gameData.status === 'live')
            {
                updateScore(gameData);
                renderGameCanvas(canvas, gameData);
            }
            else if (gameData.status === 'ended')
            {
                console.log(gameData);
            }

        });

        // Todo implement overlay and timer and leave and abort button
        const overlay = document.getElementById('gameOverlay') as HTMLDivElement;
        const timerEl = document.getElementById('timer')!;

        // register key movements and send data to the server
        sendPaddleMovements(gameDataFromServer);
        window.addEventListener("resize", () => {
            renderGameCanvas(canvas);
        });
        console.log("Canvas dimensions: ", canvas.width, canvas.height);
    }
    catch (error) {
        throw error;
    }
}

