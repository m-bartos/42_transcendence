
import { createSpinner } from "./spinner.js";
import {renderCanvas} from './canvas.js';

export function renderGame(): HTMLElement {

    let matchMakingSocket : WebSocket | null = null;
    
    const container = document.createElement('div');
    container.className = 'bg-gray-100 p-6 rounded-lg shadow-md';
    container.id = 'gameContainer';

    const gameContainer = document.createElement('div');
    gameContainer.className = 'static flex flex-col bg-gray-100 text-gray-800 rounded-md w-full h-full';

    const gameSettings = document.createElement('div');
    gameSettings.className = 'flex flex-col md:flex-row justify-around space-x-1 items-center py-2';
    gameSettings.id = 'gameSettings';

    // const switchColors = document.createElement('button');
    // switchColors.className = 'bg-gray-600 hover:bg-gray-800 text-gray-100 px-4 py-2 rounded-md';
    // switchColors.textContent = 'Switch colors';

    const findGame = document.createElement('button');
    findGame.className = 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md';
    findGame.textContent = 'Find game';

    const gameStatus = document.createElement('div');
    gameStatus.className = 'flex flex-row text-end justify-center md:justify-start w-100 items-center';

    const gameStatusStatus = document.createElement('p');
    gameStatusStatus.className = 'text-2xl font-lighter mr-2 items-center';
    gameStatusStatus.textContent = 'Status:';

    const gameStatusText = document.createElement('div');
    gameStatusText.className = 'text-2xl font-normal items-center';
    gameStatusText.textContent = 'waiting for game';
    gameStatus.appendChild(gameStatusStatus);
    gameStatus.appendChild(gameStatusText);

    //gameSettings.appendChild(switchColors);
    gameSettings.appendChild(findGame);
    gameSettings.appendChild(gameStatus);
   

    const gameContent = document.createElement('div');
    gameContent.className = `static flex flex-row w-full`;


    gameContainer.appendChild(gameSettings);
    gameContainer.appendChild(gameContent); 

    container.appendChild(gameContainer);


    function openMatchSocket() : void{
        let token = localStorage.getItem('jwt_token');
        if(token) {
            console.log('Opening socket.......................');
            if(matchMakingSocket) matchMakingSocket.close();
            matchMakingSocket = new WebSocket(`ws://localhost/api/match/ws?playerJWT=${token}`);
            console.log('Socket:', matchMakingSocket);
            let spinner = createSpinner('Searching for game', 'text-gray-800', 22);
            gameStatusText.textContent = '';
            matchMakingSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('matchMakingSocket: ', data);
                if (data.status === "searching" && data.gameId === null) {
                    //gameStatusText.textContent = 'Searching game';
                    if(!gameStatusText.contains(spinner))
                        gameStatusText.appendChild(spinner);
                }
                if (data.status === "found" && data.gameId && matchMakingSocket) {
                    matchMakingSocket.close();
                    //start game socket
                    gameStatusText.textContent = 'Hra nalezena';
                    let gameId : string | number |null = data.gameId;
                    token = localStorage.getItem('jwt_token');
                    const canvas = renderCanvas(gameId);
                    if(token) {
                        const gameSettings = document.getElementById('gameSettings');
                        if(gameSettings) {
                            gameSettings.classList.add('hidden');
                        }
                        container.classList.remove('shadow-md');
                        //openGameSocket(data.gameId, token); 
                        gameContent.appendChild(canvas);
                        gameStatusText.textContent = 'Hra ukoncena';
                    }
                }
            };
            matchMakingSocket.onerror = (error) => {
                gameStatusText.textContent = 'Error :(';
                console.error('Socket error: ', error);
            };
            matchMakingSocket.onclose = () => {
                console.log('Matchmaking socket closed');
            };
        }
    }


    findGame.addEventListener('click', openMatchSocket);

        
    return container;
}