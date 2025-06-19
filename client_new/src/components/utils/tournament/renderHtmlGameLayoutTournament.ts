//This function is probably never called !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export function renderHtmlGameLayoutTournament(parentHtml: HTMLDivElement)
{
    parentHtml.innerHTML = `
        <div class="w-full h-screen flex flex-col bg-gray-900 text-white">
            <!-- StatusBar Component -->
            <header id="statusBar" class="w-full bg-gray-800 text-white flex justify-between items-center p-5">
              <!-- Left Section -->
              <div id="leftSide" class="flex items-center gap-4">
                <!-- Avatar + Username -->
                <div class="hidden sm:flex flex-col items-center w-20">
                  <img id="player1Avatar" src="/avatar1.png" alt="avatar" class="w-12 h-12 rounded-full object-cover" />
                  <span id="player1Username" class="text-sm text-green-400 mt-1 truncate w-full text-center font-bold">Player1</span>
                </div>
                <!-- Score -->
                <div id="player1Score" class="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-400">0</div>
              </div>
            
              <!-- Center Section -->
              <div id="centerSection" class=" hidden sm:block flex-col items-center text-center">
                <div id="gameTimer" class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-400">00:00</div>
                <div id="gameStatus" class=" hidden my-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-red-600">STATUS</div>
              </div>
            
              <!-- Right Section -->
              <div id="rightSide" class="flex items-center gap-4">
                <!-- Score -->
                <div id="player2Score" class="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-400">0</div>
                <!-- Avatar + Username -->
                <div class="hidden sm:flex flex-col items-center w-20">
                  <img id="player2Avatar" src="/avatar2.png" alt="avatar" class="w-12 h-12 rounded-full object-cover" />
                  <span id="player2Username" class="text-sm text-green-400 mt-1 truncate w-full text-center font-bold">Player2</span>
                </div>
              </div>
            </header>
            <!-- End of header section-->
            <!-- Action button -->
             <div id="actionButtonContainer">
                <button type="button" id="actionButton" class="w-full p-2 bg-gray-800 font-bold text-green-400 shadow hover:bg-red-700 hover:text-white rounded">LEAVE GAME</button>
            </div>
            <!-- Game Canvas -->
            <div id="gameCanvasContainer" class="flex-grow relative bg-black flex items-center justify center">
                <div id="gameCanvasWrapper" class="aspect-[2/1] w-full max-w-full max-h-full border border-green-400">
                    <canvas id="gameCanvas" class="w-full h-full block"></canvas>
                </div>
            </div>
        </div>
        <!-- Overlay -->
        <div id="gameOverlay" class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none hidden">
          <div id="overlayContent" class="pointer-events-auto bg-gray-800 bg-opacity-90 text-white rounded-lg p-6 w-11/12 max-w-lg mx-auto overflow-hidden">
            <div class="overflow-x-auto">
              <table id="overlayTable" class="min-w-full divide-y divide-gray-700 text-sm md:text-base">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left">Username</th>
                    <th class="px-4 py-2 text-right">Score</th>
<!--                    <th class="px-4 py-2 text-right">Time Played</th>-->
                    <th class="px-4 py-2 text-right">Bounces</th>
                    <th class="px-4 py-2 text-center">Winner</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                  <tr>
                    <td id="overlayPlayer1Username" class="px-4 py-2">Player1</td>
                    <td id="overlayPlayer1Score"    class="px-4 py-2 text-right">0</td>
<!--                    <td id="overlayPlayer1Time"     class="px-4 py-2 text-right">00:00</td>-->
                    <td id="overlayPlayer1Bounces"  class="px-4 py-2 text-right">0</td>
                    <td id="overlayPlayer1Winner"   class="px-4 py-2 text-center">—</td>
                  </tr>
                  <tr>
                    <td id="overlayPlayer2Username" class="px-4 py-2">Player2</td>
                    <td id="overlayPlayer2Score"    class="px-4 py-2 text-right">0</td>
<!--                    <td id="overlayPlayer2Time"     class="px-4 py-2 text-right">00:00</td>-->
                    <td id="overlayPlayer2Bounces"  class="px-4 py-2 text-right">0</td>
                    <td id="overlayPlayer2Winner"   class="px-4 py-2 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button id="returnHomeButton" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center">
                Return To Tournament
              </button>
<!--              <button-->
<!--                id="playAgainButton" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center">-->
<!--                Play Again-->
<!--              </button>-->
            </div>
          </div>
        </div>
    `;
}

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
