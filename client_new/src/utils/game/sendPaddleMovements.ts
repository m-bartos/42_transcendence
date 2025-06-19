import { WebSocketHandler } from "../../api/webSocketHandler";
import {WsClientMovePaddle} from "../../types/multiplayer-game";

const keysPressed = { ArrowUp: false, ArrowDown: false };
const touchMPressed = { upArrowTouch: false, downArrowTouch: false };

function sendPaddleDirection(gameDataFromServer: WebSocketHandler) {
    let direction = 0;
    if (keysPressed.ArrowUp && !keysPressed.ArrowDown) direction = -1;
    else if (keysPressed.ArrowDown && !keysPressed.ArrowUp) direction = 1;
    else if (touchMPressed.upArrowTouch && !touchMPressed.downArrowTouch) direction = -1;
    else if (touchMPressed.downArrowTouch && !touchMPressed.upArrowTouch) direction = 1;

    const movePaddleMessage = {
        event: 'movePaddle',
        timestamp: Date.now(),
        data: {
            direction: direction
        }
    } as WsClientMovePaddle;

    gameDataFromServer.sendMessage(JSON.stringify(movePaddleMessage));
}

export function sendPaddleMovements(gameDataFromServer: WebSocketHandler) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            keysPressed[event.key] = true;
            sendPaddleDirection(gameDataFromServer);
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            keysPressed[event.key] = false;
            sendPaddleDirection(gameDataFromServer);
        }
    });
}

export function sendPaddleTouchMovements(gameDataFromServer: WebSocketHandler) {
    const upArrowTouch = document.getElementById('upArrowMulti') as HTMLDivElement;
    const downArrowTouch = document.getElementById('downArrowMulti') as HTMLDivElement;
    if(!upArrowTouch || !downArrowTouch) {
        console.error('Touch elements not found');
        return;
    }
    upArrowTouch.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchMPressed.upArrowTouch = true;
        sendPaddleDirection(gameDataFromServer);
    });
    upArrowTouch.addEventListener('touchend', (event) => {
        event.preventDefault();
        touchMPressed.upArrowTouch = false;
        sendPaddleDirection(gameDataFromServer);
    });
    downArrowTouch.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchMPressed.downArrowTouch = true;
        sendPaddleDirection(gameDataFromServer);
    });
    downArrowTouch.addEventListener('touchend', (event) => {
        event.preventDefault();
        touchMPressed.downArrowTouch = false;
        sendPaddleDirection(gameDataFromServer);
    });
    // Add touchmove event to prevent scrolling ???????????   vyzkouset
    // document.addEventListener('touchmove', (event) => {
    //     event.preventDefault();
    // }
    // console.log('Touch movements registered multiplayer game');
};