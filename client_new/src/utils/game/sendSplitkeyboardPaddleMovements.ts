import { WebSocketHandler } from "../../api/webSocketHandler";
import {WsClientMovePaddle} from "../../types/multiplayer-game";

const keysPressed = { ArrowUp: false, ArrowDown: false , w: false, s: false};
const touchPressed = { player1Up: false, player1Down: false, player2Up: false, player2Down: false };

function sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer: WebSocketHandler, username: string) {
    let direction = 0;

    if (keysPressed.w && !keysPressed.s) direction = -1;
    else if (keysPressed.s && !keysPressed.w) direction = 1;
    else if (touchPressed.player1Up && !touchPressed.player1Down) direction = -1;
    else if (touchPressed.player1Down && !touchPressed.player1Up) direction = 1;

    const movePaddleMessage = {
        event: 'movePaddle',
        timestamp: Date.now(),
        data: {
            direction: direction,
            username: username
        }
    } as WsClientMovePaddle;
    // console.log(movePaddleMessage);
    gameDataFromServer.sendMessage(JSON.stringify(movePaddleMessage));
}

function sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer: WebSocketHandler, username: string) {
    let direction = 0;
    if (keysPressed.ArrowUp && !keysPressed.ArrowDown) direction = -1;
    else if (keysPressed.ArrowDown && !keysPressed.ArrowUp) direction = 1;
    else if (touchPressed.player2Up && !touchPressed.player2Down) direction = -1;
    else if (touchPressed.player2Down && !touchPressed.player2Up) direction = 1;

    const movePaddleMessage = {
        event: 'movePaddle',
        timestamp: Date.now(),
        data: {
            direction: direction,
            username: username
        }
    } as WsClientMovePaddle;
    // console.log(movePaddleMessage);
    gameDataFromServer.sendMessage(JSON.stringify(movePaddleMessage));
}

// export function sendSplitkeyboardPaddleMovements(gameDataFromServer: WebSocketHandler, playerOneUsername:string, playerTwoUsername:string) {
//     document.addEventListener('keydown', (event) => {
//         if (event.key === 'w' || event.key === 's') {
//             event.preventDefault();
//             keysPressed[event.key] = true;
//             sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
//         }
//     });

//     document.addEventListener('keyup', (event) => {
//         if (event.key === 'w' || event.key === 's') {
//             event.preventDefault();
//             keysPressed[event.key] = false;
//             sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
//         }
//     });

//     document.addEventListener('keydown', (event) => {
//         if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
//             event.preventDefault();
//             keysPressed[event.key] = true;
//             sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
//         }
//     });

//     document.addEventListener('keyup', (event) => {
//         if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
//             event.preventDefault();
//             keysPressed[event.key] = false;
//             sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
//         }
//     });
// }

//const keysPressed: Record<string, boolean> = {};

function handleKeyDownPlayerOne(event: KeyboardEvent) {
    if (event.key === 'w' || event.key === 's') {
        event.preventDefault();
        keysPressed[event.key] = true;
        sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServerRef!, playerOneUsernameRef!);
    }
}

function handleKeyUpPlayerOne(event: KeyboardEvent) {
    if (event.key === 'w' || event.key === 's') {
        event.preventDefault();
        keysPressed[event.key] = false;
        sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServerRef!, playerOneUsernameRef!);
    }
}

function handleKeyDownPlayerTwo(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        keysPressed[event.key] = true;
        sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServerRef!, playerTwoUsernameRef!);
    }
}

function handleKeyUpPlayerTwo(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        keysPressed[event.key] = false;
        sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServerRef!, playerTwoUsernameRef!);
    }
}

//Uchováváme reference, které použijeme později
let gameDataFromServerRef: WebSocketHandler | null = null;
let playerOneUsernameRef: string | null = null;
let playerTwoUsernameRef: string | null = null;

export function sendSplitkeyboardPaddleMovements(
    gameDataFromServer: WebSocketHandler,
    playerOneUsername: string,
    playerTwoUsername: string
) {
    gameDataFromServerRef = gameDataFromServer;
    playerOneUsernameRef = playerOneUsername;
    playerTwoUsernameRef = playerTwoUsername;

    document.addEventListener('keydown', handleKeyDownPlayerOne);
    document.addEventListener('keyup', handleKeyUpPlayerOne);
    document.addEventListener('keydown', handleKeyDownPlayerTwo);
    document.addEventListener('keyup', handleKeyUpPlayerTwo);
}

// This will remove the event listeners and reset the references
export function removeSplitkeyboardPaddleMovements() {
    document.removeEventListener('keydown', handleKeyDownPlayerOne);
    document.removeEventListener('keyup', handleKeyUpPlayerOne);
    document.removeEventListener('keydown', handleKeyDownPlayerTwo);
    document.removeEventListener('keyup', handleKeyUpPlayerTwo);

    gameDataFromServerRef = null;
    playerOneUsernameRef = null;
    playerTwoUsernameRef = null;
}


// Functions to handle touch operations for split keyboard game --------------------------------------------------
export function sendSplitKeyboardPaddleTouchMovements(
    gameDataFromServer: WebSocketHandler,
    playerOneUsername: string,
    playerTwoUsername: string
) {
    const player1Up = document.getElementById('player1Up');
    const player1Down = document.getElementById('player1Down');
    const player2Up = document.getElementById('player2Up');
    const player2Down = document.getElementById('player2Down');
    if(!player1Up || !player1Down || !player2Up || !player2Down) {
        console.error("Touch elements for split keyboard game not found.");
        return;
    }
    player1Up.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchPressed.player1Up = true;
        sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
    });
    player1Up.addEventListener('touchend', (event) => {
        event.preventDefault();
        touchPressed.player1Up = false;
        sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
    });
    player1Down.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchPressed.player1Down = true;
        sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
    });
    player1Down.addEventListener('touchend', (event) => {
        event.preventDefault();
        touchPressed.player1Down = false;
        sendSplitkeyboardPaddleDirectionPlayerOne(gameDataFromServer, playerOneUsername);
    });
    player2Up.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchPressed.player2Up = true;
        sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
    });
    player2Up.addEventListener('touchend', (event) => {
        event.preventDefault();
        touchPressed.player2Up = false;
        sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
    });
    player2Down.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchPressed.player2Down = true;
        sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
    });
    player2Down.addEventListener('touchend', (event) => {
        event.preventDefault();
        touchPressed.player2Down = false;
        sendSplitkeyboardPaddleDirectionPlayerTwo(gameDataFromServer, playerTwoUsername);
    });
    // console.log("Touch movements for split keyboard game initialized.");
}