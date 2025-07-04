import { renderSplitKeyboardDetails } from "./splitKeyboardDetails";
import {split_keyboard_url, game_multiplayer_url, tournament_lobby_url} from "../config/api_url_config";
import Navigo from "navigo";

import splitKeyboardImage from '../assets/images/split.jpeg'
import onlineGameImage from '../assets/images/online.jpeg';
import tournamentImage from '../assets/images/tournament.jpeg';


export function renderMainPageContent(parentElement: HTMLElement, router: Navigo): void {

    document.title = "Pong - Main Page";
    const mainPageContent = document.createElement('mainContent') as HTMLDivElement;
    mainPageContent.className = "w-full min-w-[500px] min-h-max mt-6";
    mainPageContent.innerHTML = `
        <div id="homeContainer" class="w-full flex flex-col items-center lg:justify-between pt-8 lg:pt-0 ">
            <div id="crossroad" class="flex flex-col lg:flex-row items-center justify-center w-full lg:justify-between">
                <div id="splitKeyboard" class="flex flex-col items-center justify-center w-8/10 lg:w-1/3 px-8 my-4 lg:my-0 opacity-75 hover:opacity-100 transition duration-300 ease-in-out cursor-pointer">
                    <h2 class="text-2xl mb-8 uppercase">Split keyboard</h2>
                    <a href=${split_keyboard_url} data-navigo>
                        <img src=${splitKeyboardImage} alt="Split keyboard" class="w-full h-full rounded-lg">
                    </a>
                </div>
                
                <div id="onlineGame" class="flex flex-col items-center justify-center w-8/10 lg:w-1/3 px-8 my-4 lg:my-0 opacity-75 hover:opacity-100 transition duration-300 ease-in-out cursor-pointer">
                    <h2 class="text-2xl mb-8 uppercase">Online game</h2>
                    <a href=${game_multiplayer_url} data-navigo>
                        <img src=${onlineGameImage} alt="Online game" class="w-full h-full rounded-lg">
                    </a>
                </div>
                
                <div id="tournament" class="flex flex-col items-center justify-center w-8/10 lg:w-1/3 px-8 my-4 lg:my-0 opacity-75 hover:opacity-100 transition duration-300 ease-in-out cursor-pointer">
                    <h2 class="text-2xl mb-8 uppercase">Tournament</h2>
                    <a href=${tournament_lobby_url} data-navigo>
                        <img src=${tournamentImage} alt="Tournament" class="w-full h-full rounded-lg">  
                    </a>
                </div>
            </div>
            
            <div id="hintHolder" class="hidden md:flex mt-12 text-xl px-8 text-center min-h-16 tracking-wide">
                Hint: Click on the image to select a game!
            </div>
        </div>
    `;
    parentElement.append(mainPageContent);

    const crossroad = document.getElementById('crossroad');
    const splitKeyboardImg = document.getElementById('splitKeyboard');
    const onlineGameImg = document.getElementById('onlineGame');
    const tournamentImg = document.getElementById('tournament');
    const hintHolder = document.getElementById('hintHolder');

    if (!splitKeyboardImg || !onlineGameImg || !tournamentImg || !hintHolder  || !crossroad) {
        console.error('One or more elements on the main page crossroad not found');
    } else {
        splitKeyboardImg.addEventListener('mouseover', () => {
            hintHolder.textContent = 'Click here to play the game with your friend on the same keyboard!';
        });
        onlineGameImg.addEventListener('mouseover', () => {
            hintHolder.textContent = 'Choose this image to play the game online! System will find you a random player to play with.';
        });
        tournamentImg.addEventListener('mouseover', () => {
            hintHolder.textContent = 'Select this mode to play a tournament! You can play with your friends or random players.';
        });
        crossroad.addEventListener('mouseleave', () => {
            hintHolder.textContent = 'Hint: Each image represents a different game style!';
        });
    };
};