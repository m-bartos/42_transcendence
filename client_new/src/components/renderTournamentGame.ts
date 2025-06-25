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
import {
    PlayerState,
    SplitkeyboardGameEvent,
    WsDataCountdown,
    WsDataLive,
    WsGameDataProperties
} from "../types/splitkeyboard-game";
import {recordGameTime} from "../utils/game/updateGameTimer";
import {GameTimer} from "../utils/game/gameTimer";
import {updateGameStatus} from "../utils/game/updateGameStatus";
import {updateGameOverlay} from "../utils/game/updateGameOverlay";
import {handleClicksOnOverlay} from "../utils/game/handleClicksOnOverlay";
import {sendSplitkeyboardPaddleMovements} from "../utils/game/sendSplitkeyboardPaddleMovements";
import {sendSplitKeyboardPaddleTouchMovements} from "../utils/game/sendSplitkeyboardPaddleMovements";
import {home_page_url} from "../config/api_url_config";
import { isMobileDevice } from "./utils/game/gameUtils";

// function leaveMatchmaking(router: Navigo, gameDataFromServer: WebSocketHandler) {
//     sendLeaveMatchmaking(gameDataFromServer);
//     router.navigate(home_page_url);
// }

let playerOneUsername = '';
let playerTwoUsername = '';

function setUsernames(players: PlayerState[]) {
    if (players && players[0] && players[1] && players[0].username && players[1].username)
    {
        playerOneUsername = players[0].username;
        playerTwoUsername = players[1].username;

    }
    else
    {
        console.error('Error parsing player usernames');
    }
}

export function renderTournamentGame(router: Navigo, gameDataFromServer: WebSocketHandler, tournamentId: string) {
    const app = document.getElementById('app') as HTMLDivElement;

    try {
        setHtmlParentProps(app);
        renderHtmlGameLayout(app, GameType.Tournament);
        const actionButton = document.getElementById(actionButtonId) as HTMLButtonElement;
        const gameOverlay = document.getElementById(gameOverlayId) as HTMLDivElement;
        
        const canvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
        if (!canvasWrapper) {
            console.error('Canvas wrapper not found');
            return;
        }
        const canvas = document.createElement('canvas');
        canvasWrapper.append(canvas)
        
        //const canvas = document.getElementById(gameCanvasId) as HTMLCanvasElement;
        renderGameCanvas(GameType.Tournament, canvas);
        const gameTimer = document.getElementById(gameTimerId) as HTMLDivElement;
        const timer = new GameTimer(gameTimer);
        // const leaveMatchmakingHandler = () => leaveMatchmaking(router, gameDataFromServer);

        const leaveTournament = () => router.navigate(home_page_url); // TODO: do it properly! -> close and leave
        // Start listening for game events
        actionButton.addEventListener('click', leaveTournament); // clean this listeners
        gameDataFromServer.addEventListener('gameData', (e:Event)=> {
            const gameData = (e as CustomEvent).detail;
            if (gameData.event === SplitkeyboardGameEvent.GameProperties)
            {
                const data = gameData.data as WsGameDataProperties;
                if (data.players)
                {
                    setUsernames(data.players);
                    // register key movements and send data to the server
                    sendSplitkeyboardPaddleMovements(gameDataFromServer, playerOneUsername, playerTwoUsername);
                    if (isMobileDevice()) {
                        sendSplitKeyboardPaddleTouchMovements(gameDataFromServer, playerOneUsername, playerTwoUsername);
                    }
                }
                renderGameCanvas(GameType.Tournament, canvas, undefined, data);
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
                renderGameCanvas(GameType.Tournament, canvas, data);
                recordGameTime('live', timer);

            }
            else if (gameData.event === SplitkeyboardGameEvent.Ended)
            {
                actionButton.classList.add('hidden');
                updateGameStatus("Game Ended");
                recordGameTime('ended', timer);
                updateGameOverlay(gameData);
                handleClicksOnOverlay(router, GameType.Tournament, tournamentId);
            }
        });


        // register resize listener and resize canvas
        window.addEventListener("resize", () => {
            renderGameCanvas(GameType.Tournament, canvas);
        });

    }
    catch (error) {
        throw error;
    }
}

