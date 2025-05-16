import { WebSocketHandler } from "../../api/webSocketHandler";
import {WsClientMovePaddle} from "../../types/game";

const keysPressed = { ArrowUp: false, ArrowDown: false };

function sendPaddleDirection(gameDataFromServer: WebSocketHandler) {
    let direction = 0;
    if (keysPressed.ArrowUp && !keysPressed.ArrowDown) direction = -1;
    else if (keysPressed.ArrowDown && !keysPressed.ArrowUp) direction = 1;

    const movePaddleMessage = {
        status: 'movePaddle',
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