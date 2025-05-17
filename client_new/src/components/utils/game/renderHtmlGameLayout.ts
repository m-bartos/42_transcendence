export function renderHtmlGameLayout(parentHtml: HTMLDivElement)
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
                  <span id="player1Username" class="text-sm text-white mt-1 truncate w-full text-center">Player1</span>
                </div>
                <!-- Score -->
                <div id="player1Score" class="text-5xl font-bold text-green-400">0</div>
              </div>
            
              <!-- Center Section -->
              <div id="gameTimer" class="hidden sm:block text-4xl font-extrabold text-yellow-300">
                00:00
              </div>
            
              <!-- Right Section -->
              <div id="rightSide" class="flex items-center gap-4">
                <!-- Score -->
                <div id="player2Score" class="text-5xl font-bold text-green-400">0</div>
                <!-- Avatar + Username -->
                <div class="hidden sm:flex flex-col items-center w-20">
                  <img id="player2Avatar" src="/avatar2.png" alt="avatar" class="w-12 h-12 rounded-full object-cover" />
                  <span id="player2Username" class="text-sm text-white mt-1 truncate w-full text-center">Player2</span>
                </div>
              </div>
            </header>
            <!-- End of header section-->
            <!-- Game Canvas -->
            <div id="gameCanvasContainer" class="flex-grow relative bg-black flex items-center justify center">
                <div id="gameCanvasWrapper" class="aspect-[2/1] w-full max-w-full max-h-full border border-yellow-500">
                    <canvas id="gameCanvas" class="w-full h-full block"></canvas>
                </div>
            </div>
        </div>
        <!-- Overlay -->
<!--        <div id="gameOverlay" class="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 opacity-0"></div>-->
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
export const gameCanvasContainerId = 'gameCanvasContainer';
export const gameCanvasId = 'gameCanvas';
