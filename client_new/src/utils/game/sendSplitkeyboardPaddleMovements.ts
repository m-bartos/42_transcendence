import { WebSocketHandler } from "../../api/webSocketHandler";
import {WsClientMovePaddle} from "../../types/multiplayer-game";

const keysPressed = { ArrowUp: false, ArrowDown: false , w: false, s: false};

function sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer: WebSocketHandler, username: string) {
    let direction = 0;

    if (keysPressed.w && !keysPressed.s) direction = -1;
    else if (keysPressed.s && !keysPressed.w) direction = 1;

    const movePaddleMessage = {
        event: 'movePaddle',
        timestamp: Date.now(),
        data: {
            direction: direction,
            username: username
        }
    } as WsClientMovePaddle;
    console.log(movePaddleMessage);
    gameDataFromServer.sendMessage(JSON.stringify(movePaddleMessage));
}

function sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer: WebSocketHandler, username: string) {
    let direction = 0;
    if (keysPressed.ArrowUp && !keysPressed.ArrowDown) direction = -1;
    else if (keysPressed.ArrowDown && !keysPressed.ArrowUp) direction = 1;

    const movePaddleMessage = {
        event: 'movePaddle',
        timestamp: Date.now(),
        data: {
            direction: direction,
            username: username
        }
    } as WsClientMovePaddle;
    console.log(movePaddleMessage);
    gameDataFromServer.sendMessage(JSON.stringify(movePaddleMessage));
}

export function sendSplitkeyboardPaddleMovements(gameDataFromServer: WebSocketHandler, playerOneUsername:string, playerTwoUsername:string) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w' || event.key === 's') {
            event.preventDefault();
            keysPressed[event.key] = true;
            sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w' || event.key === 's') {
            event.preventDefault();
            keysPressed[event.key] = false;
            sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            keysPressed[event.key] = true;
            sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            keysPressed[event.key] = false;
            sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
        }
    });
}