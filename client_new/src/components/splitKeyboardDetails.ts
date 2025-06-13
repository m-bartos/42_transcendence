import {renderSplitKeyboardContent} from './utils/splitKeyboard/splitKeyboardUtils';
import {renderNav} from "./renderNavigation";
import {renderFooter} from "./renderFooter";
import { handleMenu } from "./utils/navigation/naviUtils";
import Navigo from "navigo";

export function renderSplitKeyboardDetails(router: Navigo): void {

    document.title = "Pong - Split Keyboard";
    const app = document.getElementById('app') as HTMLDivElement;
    if (!app) {
        console.error('Parent element not found');
        return;
    }
    app.replaceChildren(); // Clear the parent element
    app.className = "min-w-[500px] w-full md:container flex flex-col justify-between min-h-dvh md:p-4 relative mx-auto";
    try{
        renderNav(app);
        //take obsah hlavni stranky
        renderSplitKeyboardDetailsContent(router, app);
        ///a na konec footer
        renderFooter(app);
        //zde je potreba pridat event listener na logout a ostatni menu funkce a listenery
        handleMenu();
    }
    catch (error) {
        console.error('Error rendering split keyboard details:', error);
    }

};

function renderSplitKeyboardDetailsContent(router: Navigo, parentElement: HTMLElement): void {
    const splitKeyboardPageCOntent = document.createElement('div');
    splitKeyboardPageCOntent.className = "w-full min-w-[500px] min-h-max mt-6";
    
     splitKeyboardPageCOntent.innerHTML = `

        <!-- Header Section -->
        <h2 class="text-2xl pb-12 uppercase w-4/5 md:w-3/5 text-center border-b-1 border-gray-200 tracking-[1rem] mx-auto">
            Game Settings
        </h2>

        <!-- Player Names Section -->
        <div class="flex flex-col md:flex-row items-center justify-center w-full md:justify-around pt-12 px-2">
            <div class="flex flex-col items-center w-4/5 md:w-1/2">
            <label for="player1Name" class="text-xl mb-2">Player 1 Name:</label>
            <input
                id="player1Name"
                type="text"
                placeholder="Player 1   (max 10 characters)"
                maxlength="10"
                class="border border-gray-300 rounded px-4 py-2 w-4/5 bg-white"
            />
            </div>
            <div class="flex flex-col items-center w-4/5 md:w-1/2">
            <label for="player2Name" class="text-xl mb-2">Player 2 Name:</label>
            <input
                id="player2Name"
                type="text"
                placeholder="Player 2   (max 10 characters)"
                maxlength="10"
                class="border border-gray-300 rounded px-4 py-2 w-4/5 bg-white "
            />
            </div>
        </div>

        <!-- Color Selector Section -->
        <div class="flex flex-col items-center justify-center w-full lg:justify-between mt-24 px-2">
            <h2 class="text-xl mb-12 uppercase tracking-widest">Pick colors for your game</h2>
            <div class="flex flex-col lg:flex-row items-center justify-center w-full lg:justify-around">
            <div class="flex flex-col items-center w-4/5 lg:w-1/2">
                <p class="pl-4 text-xl mb-2 w-full text-center ">Background Color:</p>
                <div class="flex gap-2 mb-2" id="bg-color-row"></div>

                <p class="pl-4 text-xl mb-2 w-full text-center ">Paddle Color:</p>
                <div class="flex gap-2 mb-2" id="paddle-color-row"></div>

                <p class="pl-4 text-xl mb-2 w-full text-center ">Ball Color:</p>
                <div class="flex gap-2" id="ball-color-row"></div>
            </div>
            <div class="flex flex-col items-center mt-12 lg:mt-0 h-auto w-4/5 lg:w-1/2 justify-between">
                <canvas
                id="colorCanvas"
                width="500"
                height="250"
                class="border border-gray-400 rounded-md"
                ></canvas>
            </div>
            </div>
        </div>

        <!-- Buttons Section -->
        <div class="flex flex-col md:flex-row items-center justify-center w-full md:justify-around mt-24">
            <button
            id="cancelBtn"
            class="no-button min-w-[180px] w-1/5 p-4 my-4 md:mx-0"
            >
            Cancel
            </button>
            <button
            id="confirmBtn"
            class="yes-button min-w-[180px] w-1/5 p-4 my-4 md:mx-0"
            >
            Lets Play!
            </button>
        </div>
        </div>

    `;
    parentElement.append(splitKeyboardPageCOntent);
    try{
        renderSplitKeyboardContent(router);
    }
    catch (error) {
        console.error('Error rendering split keyboard content:', error);
    }
};