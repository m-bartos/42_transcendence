import Navigo from "navigo";
import {WebSocketHandler} from "../api/webSocketHandler";
import {
    actionButtonId,
    gameCanvasId,
    gameOverlayId,
    gameTimerId,
    GameType,
    renderHtmlGameLayout
} from "./utils/game/renderHtmlGameLayout";
import {renderGameCanvas} from "./utils/game/renderGameCanvas";
import {updateScore, updateUsername} from "../utils/game/updateGameDomData";
import {setHtmlParentProps} from "./utils/game/setHtmlParrentProps";
import {SplitkeyboardGameEvent, WsDataCountdown, WsDataLive, WsGameDataProperties} from "../types/splitkeyboard-game";
import {recordGameTime} from "../utils/game/updateGameTimer";
import {GameTimer} from "../utils/game/gameTimer";
import {updateGameStatus} from "../utils/game/updateGameStatus";
import {updateGameOverlay} from "../utils/game/updateGameOverlay";
import {handleClicksOnOverlay} from "../utils/game/handleClicksOnOverlay";
import {sendSplitkeyboardPaddleMovements} from "../utils/game/sendSplitkeyboardPaddleMovements";
import {home_page_url} from "../config/api_url_config";

// function leaveMatchmaking(router: Navigo, gameDataFromServer: WebSocketHandler) {
//     sendLeaveMatchmaking(gameDataFromServer);
//     router.navigate(home_page_url);
// }

let playerOneUsername = '';
let playerTwoUsername = '';

function setUsernames(){
    const gameSettingsString = localStorage.getItem('splitkeyboardSettings');

    if (gameSettingsString == null)
    {
        console.error('No splitkeyboard game settings found in local storage.');
        return;
    }
    try
    {
        let gameSettings = JSON.parse(gameSettingsString);
        if (gameSettings)
        {
        playerOneUsername = gameSettings.player1;
        playerTwoUsername = gameSettings.player2;
        }
    }
    catch (error)
    {
        console.error('Error parsing game settings from local storage:', error);
    }
}

function sendSplitkeyboardGameProperties(ws: WebSocketHandler) {
    const msg = {
        event: SplitkeyboardGameEvent.GameProperties,
        timestamp: Date.now(),
        data: {
            "playerOneUsername": playerOneUsername,
            "playerTwoUsername": playerTwoUsername
        }
    }
    ws.sendMessage(JSON.stringify(msg))
}

export function renderGameSplitkeyboard(router: Navigo, gameDataFromServer: WebSocketHandler) {
    const app = document.getElementById('app') as HTMLDivElement;

    try {
        setHtmlParentProps(app);
        renderHtmlGameLayout(app, GameType.Splitkeyboard);
        const actionButton = document.getElementById(actionButtonId) as HTMLButtonElement;
        const gameOverlay = document.getElementById(gameOverlayId) as HTMLDivElement;
        const canvas = document.getElementById(gameCanvasId) as HTMLCanvasElement;
        renderGameCanvas(canvas);
        const gameTimer = document.getElementById(gameTimerId) as HTMLDivElement;
        const timer = new GameTimer(gameTimer);
        // const leaveMatchmakingHandler = () => leaveMatchmaking(router, gameDataFromServer);

        setUsernames();

        setTimeout(() => sendSplitkeyboardGameProperties(gameDataFromServer), 1000); // TODO: is setTimeoout the best thing to do? I have to wait till the ws is connected and OPEN
        const leaveSplitkeyboardGame = () => router.navigate(home_page_url); // TODO: do it properly! -> close and leave
        // Start listening for game events
        actionButton.addEventListener('click', leaveSplitkeyboardGame); // clean this listeners
        gameDataFromServer.addEventListener('gameData', (e:Event)=> {
            const gameData = (e as CustomEvent).detail;
            // console.log(gameData);
            if (gameData.event === SplitkeyboardGameEvent.GameProperties)
            {
                const data = gameData.data as WsGameDataProperties;
                renderGameCanvas(canvas, undefined, data);
                // actionButton.innerHTML = "ABORT GAME";
                // TODO: delete previous listeners for matchmaking
                // actionButton.removeEventListener('click', leaveMatchmakingHandler);
                // actionButton.addEventListener('click', () => {
                //     sendLeaveGame(gameDataFromServer);
                // });
            }
            else if (gameData.event === SplitkeyboardGameEvent.Countdown)
            {
                const data = gameData.data as WsDataCountdown;
                updateGameStatus(data.countdown.toString());
                updateUsername(data.players);
            }
            else if (gameData.event === SplitkeyboardGameEvent.Live)
            {
                const data = gameData.data as WsDataLive;
                updateGameStatus('Live');
                updateScore(data);
                renderGameCanvas(canvas, data);
                recordGameTime('live', timer);

            }
            else if (gameData.event === SplitkeyboardGameEvent.Ended)
            {
                actionButton.classList.add('hidden');
                updateGameStatus("Game Ended");
                recordGameTime('ended', timer);
                updateGameOverlay(gameData);
                handleClicksOnOverlay(router, GameType.Splitkeyboard);
            }
        });

        // register key movements and send data to the server
        sendSplitkeyboardPaddleMovements(gameDataFromServer, playerOneUsername, playerTwoUsername);
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

