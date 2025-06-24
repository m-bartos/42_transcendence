import { getAvatar } from "../../../api/getUserInfo";
import { isMobileDevice, 
          isPortrait,
          restyleMultiGameLayoutToHeight,
          restyleMultiGameLayoutToWidth,
          restyleTournamentGameLayoutToHeight,
          restyleTournamentGameLayoutToWidth } from "./gameUtils";
import { renderGameCanvas, resizeCanvas } from "./renderGameCanvas";

export enum GameType {
    Tournament = 'Tournament',
    Splitkeyboard = 'Splitkeyboard',
    Multiplayer = 'Multiplayer',
}
export interface SplitKeyboardSettings {
    player1: string;
    player2: string;
    background: string;
    paddle: string;
    ball: string;
};


export function renderHtmlGameLayout(parentHtml: HTMLDivElement, gameType: GameType.Multiplayer | GameType.Splitkeyboard | GameType.Tournament) {

    const gameData : SplitKeyboardSettings = JSON.parse(localStorage.getItem('splitkeyboardSettings') || '{}');
    const backgroundColor = gameType === GameType.Splitkeyboard ? gameData.background : 'bg-gray-100';

    const avatarUrl = getAvatar("");
    
    
    const touchZoneSimple = `
        <span id="upArrowMulti" class="text-xl text-gray-500 text-center px-10 py-8">&#9651;</span>
        <span class="text-xl block text-gray-500 my-2">&#9678;</span>
        <span id="downArrowMulti" class="text-xl text-gray-500  text-center px-10 py-8">&#9661;</span>
    `;
    
    const touchZoneDouble1 = `
        <span id="player1Up" class="text-xl text-gray-500 text-center px-10 py-8">&#9651;</span>
        <span class="text-xl block text-gray-500 my-2">&#9678;</span>
        <span id="player1Down" class="text-xl text-gray-500 text-center px-10 py-8">&#9661;</span>
    `;

    const touchZoneDouble2 = `
        <span id="player2Up" class="text-xl text-gray-500 text-center px-10 py-8">&#9651;</span>
        <span class="text-xl block text-gray-500 my-2">&#9678;</span>
        <span id="player2Down" class="text-xl text-gray-500 text-center px-10 py-8">&#9661;</span>
    `;

    let canvasWrapper = `
      <div id="gameCanvasContainer" class="flex-grow relative items-center justify-center">
        <div id="gameCanvasWrapper" class="flex aspect-[2/1] max-w-[90%] max-h-full border mx-auto border-gray-600 rounded-md mb-8 overflow-hidden" style="background-color: ${backgroundColor};">
        </div>
      </div>
    `;

    if(gameType === GameType.Multiplayer && isMobileDevice() && isPortrait()) {
      canvasWrapper = `<div id="gameCanvasContainer" class="flex flex-col relative items-center justify-center mb-1">
          <div id="gameCanvasWrapper" class="aspect-[2/1] w-[90%] max-h-full border mx-auto border-gray-600 rounded-md overflow-hidden" style="background-color: ${backgroundColor};">
          </div>
          <div id="multiPlayerTouchZone" class="rounded-md my-4 ml-2 mr-2 max-w-[20%] flex flex-col items-center justify-between  select-none border-2 border-gray-400">
            ${touchZoneSimple}
          </div>
        </div>
      `;
    } else if (gameType === GameType.Multiplayer && isMobileDevice() && !isPortrait()) {
      canvasWrapper = `<div id="gameCanvasContainer" class="flex flex-row w-[90%] mx-auto relative items-center justify-between mb-1">
          <div id="gameCanvasWrapper" class="aspect-[2/1] h-full border mx-auto border-gray-600 rounded-md overflow-hidden" style="background-color: ${backgroundColor};">
          </div>
          <div id="multiPlayerTouchZone" class="rounded-md w-1/10 flex flex-col items-center justify-between select-none border-2 border-gray-400">
            ${touchZoneSimple}
          </div>
        </div>
      `;
    } else if(gameType != GameType.Multiplayer && isMobileDevice() && isPortrait()) {
      canvasWrapper = `<div id="gameCanvasContainer" class="grid grid-cols-2 w-[90%] mx-auto relative items-center justify-between mb-1">
          <div id="gameCanvasWrapper" class="aspect-[2/1] col-span-2 w-full max-h-full border mx-auto border-gray-600 rounded-md overflow-hidden" style="background-color: ${backgroundColor};">
          </div>
            <div id="splitTournamentTouchZone" class="justify-self-start rounded-md w-4/10 mt-4 h-full flex flex-col items-center justify-around select-none border-2 border-gray-400">
              ${touchZoneDouble1}
            </div>
            <div id="splitTournamentTouchZone2" class="justify-self-end rounded-md w-4/10 mt-4 h-full flex flex-col items-center justify-around select-none border-2 border-gray-400">
              ${touchZoneDouble2}
            </div>
        </div>
      `;
    } else if(gameType != GameType.Multiplayer && isMobileDevice() && !isPortrait()) {
      canvasWrapper = `<div id="gameCanvasContainer" class="mx-auto w-[90%] grid grid-cols-3 items-center justify-around mb-1'">
          <div id="splitTournamentTouchZone" class="justify-self-start rounded-md w-[20%] h-full flex flex-col items-center justify-around select-none border-2 border-gray-400">
            ${touchZoneDouble1}
          </div>
          <div id="gameCanvasWrapper" class="aspect-[2/1] justify-self-center flex-grow max-h-full border border-gray-600 rounded-md overflow-hidden" style="background-color: ${backgroundColor};">
          </div>
          <div id="splitTournamentTouchZone2" class="justify-self-end rounded-md w-[20%] h-full flex flex-col items-center justify-around select-none border-2 border-gray-400">
            ${touchZoneDouble2}
          </div>
        </div>
      `;
    };

    const buttonsHtml = gameType === GameType.Tournament
        ? `
            <div class="mt-6 flex justify-center">
              <button id="returnTournamentButton" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center">
                Return to Tournament
              </button>
            </div>
          `
        : `
            <div class="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button id="returnHomeButton" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center">
                Return Home
              </button>
              <button id="playAgainButton" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center">
                Play Again
              </button>
            </div>
          `;

    parentHtml.innerHTML = `
        <div class="w-full h-screen flex flex-col min-w-[500px]">
            <!-- StatusBar Component -->
            <header id="statusBar" class="w-full flex justify-between items-center px-32 sm:px-8 md:px-24 lg:px-32">
              <!-- Left Section -->
              <div id="leftSide" class="flex items-center gap-4">
                <!-- Avatar + Username -->
                <div class="hidden sm:flex flex-col items-center lg:w-32">
                  ${
                    gameType === GameType.Multiplayer
                        ? `
                            <img id="player1Avatar" src="${avatarUrl}" alt="avatar" class="w-12 h-12 rounded-full object-cover" />
                        `
                        : ''
                }
                <span id="player1Username" class="text-sm mt-1 truncate w-full text-center font-bold">Player1</span>
                </div>
                <!-- Score -->
                <div id="player1Score" class="text-4xl sm:text-5xl lg:text-6xl font-bold ">0</div>
              </div>
            
              <!-- Center Section -->
              <div id="centerSection" class=" hidden sm:block flex-col items-center text-center">
                <div id="gameTimer" class="text-2xl sm:text-3xl lg:text-4xl font-normal">00:00</div>
                <div id="gameStatus" class="hidden my-2 text-2xl sm:text-3xl lg:text-4xl font-light text-red-600">STATUS</div>
              </div>
            
              <!-- Right Section -->
              <div id="rightSide" class="flex items-center gap-4">
                <!-- Score -->
                <div id="player2Score" class="text-4xl sm:text-5xl lg:text-6xl font-bold">0</div>
                <!-- Avatar + Username -->
                <div class="hidden sm:flex flex-col items-center lg:w-32">
                  ${
                    gameType === GameType.Multiplayer
                        ? `
                              <img id="player2Avatar" src="${avatarUrl}" alt="avatar" class="w-12 h-12 rounded-full object-cover" />
                                    `
                        : ''
                }
                  <span id="player2Username" class="text-sm  mt-1 truncate w-full text-center font-bold">Player2</span>
                </div>
              </div>
            </header>
            <!-- End of header section-->
            <!-- Action button -->
             <div id="actionButtonContainer" class="w-full flex justify-center mt-4">
                <button type="button" id="actionButton" class="no-button py-2 w-[90%] mb-2">LEAVE GAME</button>
            </div>
            <!-- Game Canvas -->
             ${canvasWrapper}
        <!-- Overlay -->
        <div id="gameOverlay" class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none hidden">
          <div id="overlayContent" class="pointer-events-auto bg-gray-800 bg-opacity-90 text-white rounded-lg p-6 w-11/12 max-w-lg mx-auto overflow-hidden">
            <div class="overflow-x-auto">
              <table id="overlayTable" class="min-w-full divide-y divide-gray-700 text-sm md:text-base">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left">Username</th>
                    <th class="px-4 py-2 text-right">Score</th>
                    <th class="px-4 py-2 text-right">Bounces</th>
                    <th class="px-4 py-2 text-center">Winner</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                  <tr>
                    <td id="overlayPlayer1Username" class="px-4 py-2">Player1</td>
                    <td id="overlayPlayer1Score"    class="px-4 py-2 text-right">0</td>
                    <td id="overlayPlayer1Bounces"  class="px-4 py-2 text-right">0</td>
                    <td id="overlayPlayer1Winner"   class="px-4 py-2 text-center">—</td>
                  </tr>
                  <tr>
                    <td id="overlayPlayer2Username" class="px-4 py-2">Player2</td>
                    <td id="overlayPlayer2Score"    class="px-4 py-2 text-right">0</td>
                    <td id="overlayPlayer2Bounces"  class="px-4 py-2 text-right">0</td>
                    <td id="overlayPlayer2Winner"   class="px-4 py-2 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            ${buttonsHtml}
          </div>
        </div>
    `;

     window.matchMedia("(orientation: portrait)").addEventListener("change", (e) => {
      if (e.matches && gameType === GameType.Multiplayer && isMobileDevice()) {
        console.log("Změněno na výšku");
        restyleMultiGameLayoutToHeight();
      } else if (!e.matches && gameType === GameType.Multiplayer && isMobileDevice()) {
        console.log("Změněno na šířku");
        restyleMultiGameLayoutToWidth();
      } else if (e.matches && gameType !== GameType.Multiplayer && isMobileDevice()) {
        console.log("Změněno na výšku pro turnaj nebo splitkeyboard");
        restyleTournamentGameLayoutToHeight();
      }
      else if (!e.matches && gameType !== GameType.Multiplayer && isMobileDevice()) {
        console.log("Změněno na šířku pro turnaj nebo splitkeyboard");
        restyleTournamentGameLayoutToWidth();
      }
      if(isMobileDevice()){
        renderGameCanvas(gameType, document.querySelector('#gameCanvasWrapper canvas') as HTMLCanvasElement);
      }
    });
    
    
};

export const statusBarId = 'statusBar';
export const player1UsernameId = 'player1Username';
export const player1ScoreId = 'player1Score';
export const player1AvatarId = 'player1Avatar';
export const player2UsernameId = 'player2Username';
export const player2ScoreId = 'player2Score';
export const player2AvatarId = 'player2Avatar';
export const gameTimerId = 'gameTimer';
export const gameStatusId = 'gameStatus';
export const actionButtonId = 'actionButton';
export const gameCanvasContainerId = 'gameCanvasContainer';
export const gameCanvasId = 'gameCanvas';
// Game Ended Overlay
export const gameOverlayId = 'gameOverlay';
// Overlay element IDs for Player 1
export const overlayPlayer1UsernameId = 'overlayPlayer1Username';
export const overlayPlayer1ScoreId    = 'overlayPlayer1Score';
export const overlayPlayer1BouncesId  = 'overlayPlayer1Bounces';
export const overlayPlayer1WinnerId   = 'overlayPlayer1Winner';
// Overlay element IDs for Player 2
export const overlayPlayer2UsernameId = 'overlayPlayer2Username';
export const overlayPlayer2ScoreId    = 'overlayPlayer2Score';
export const overlayPlayer2BouncesId  = 'overlayPlayer2Bounces';
export const overlayPlayer2WinnerId   = 'overlayPlayer2Winner';
// Buttons
export const returnHomeButtonId = 'returnHomeButton';
export const playAgainButtonId = 'playAgainButton';
export const returnTournamentButtonId = 'returnTournamentButton';