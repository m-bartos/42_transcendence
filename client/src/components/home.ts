import { renderGame } from './game.js';
import { renderSplitKeyboardDetails } from './splitKeyboardDetails.js';

export function renderHomePage(): HTMLElement {
    document.title = 'Transcendence Home';
    const container = document.createElement('div');
    container.className = 'w-full flex flex-col items-center lg:justify-between pt-8 lg:pt-32 animate-wiggle';
    container.id = 'homeContainer';

    const gameShortcutsHolder = document.createElement('div');
    gameShortcutsHolder.className = 'flex flex-col lg:flex-row items-center justify-center w-full lg:justify-between';
    const hintHolder = document.createElement('div');
    hintHolder.className = 'flex mt-12 text-xl px-8 text-center';
    hintHolder.textContent = 'Hint: Click on the image to select a game!';

    const splitKeyboard = document.createElement('div');
    const onlineGame = document.createElement('div');
    const tournament = document.createElement('div');


    splitKeyboard.className = 'flex flex-col items-center justify-center w-8/10 lg:w-1/3 px-8 my-4 lg:my-0 opacity-75 hover:opacity-100 transition duration-300 ease-in-out cursor-pointer';
    onlineGame.className = 'flex flex-col items-center justify-center w-8/10 lg:w-1/3 px-8 my-4 lg:my-0 opacity-75 hover:opacity-100 transition duration-300 ease-in-out cursor-pointer';
    tournament.className = 'flex flex-col items-center justify-center w-8/10 lg:w-1/3 px-8 my-4 lg:my-0 opacity-75 hover:opacity-100 transition duration-300 ease-in-out cursor-pointer';

    const splitHeader = document.createElement('h2');
    const onlineHeader = document.createElement('h2');
    const tournamentHeader = document.createElement('h2');


    splitHeader.className = 'text-2xl mb-8 uppercase';
    onlineHeader.className = 'text-2xl mb-8 uppercase';
    tournamentHeader.className = 'text-2xl mb-8 uppercase';

    splitHeader.innerText = 'Split keyboard';
    onlineHeader.innerText = 'Online game';
    tournamentHeader.innerText = 'Tournament';

    const splitImage = document.createElement('img');
    const onlineImage = document.createElement('img');
    const tournamentImage = document.createElement('img');

    splitImage.src = '../src/assets/images/split.jpeg'; 
    onlineImage.src = '../src/assets/images/online.jpeg';
    tournamentImage.src = '../src/assets/images/tournament.jpeg';

    splitImage.className = 'w-full h-full rounded-lg ';
    onlineImage.className = 'w-full h-full rounded-lg ';
    tournamentImage.className = 'w-full h-full rounded-lg';

    splitImage.alt = 'Split keyboard';
    onlineImage.alt = 'Online game';
    tournamentImage.alt = 'Tournament';

    splitKeyboard.append(splitHeader, splitImage);
    onlineGame.append(onlineHeader, onlineImage);
    tournament.append(tournamentHeader, tournamentImage);
    gameShortcutsHolder.append(splitKeyboard, onlineGame, tournament);

    container.append(gameShortcutsHolder, hintHolder);

    splitKeyboard.addEventListener('mouseover', () => {
        hintHolder.textContent = `Click on this image to play the game on the same keyboard!`;
    });
    onlineGame.addEventListener('mouseover', () => {
        hintHolder.textContent = `Choose this image to play the game online! System will find you a random player to play with.`;
    });
    tournament.addEventListener('mouseover', () => {
        hintHolder.textContent = `Click on this image to play the game in tournament mode! You can play with your friends or random players.`;
    });


    gameShortcutsHolder.addEventListener('mouseleave', () => {
        hintHolder.textContent = 'Hint: Click on the image to play the game!';
    });
    //---------------------------------------------------------------------------------------------------------------------------
    splitKeyboard.addEventListener('click', () => {
        //history.pushState(null, '', '/splitKeyboard');
        renderSplitKeyboardDetails();
    });

    console.log("page HOME loaded");
    
    return container;
}