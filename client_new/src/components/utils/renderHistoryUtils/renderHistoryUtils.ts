import { BaseGame, MultiGame, MultiGamesManager, SplitGame } from "../../../api/gamesManager";
import { UserData } from "../../../api/user";
import {base_url, tournament_lobby_url} from "../../../config/api_url_config";
import { getAvatar } from "../../../api/getUserInfo";
import Navigo from "navigo";
import {friend_profile_url} from "../../../config/api_url_config";
import {getTournamentStats} from "../tournament/renderTournamentContent";
import {GetTournamentStatsDataPlayerRanking} from "../../../types/tournament/getTournamentStats";
import {getPlayerData} from "../dashboard/dashboardUtils";



// === DOM HELPERS ===
export function createMainContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center justify-center';
  return container;
}

export function createGameSection(id: string, title: string, marginTop: string = 'mt-6'): HTMLElement {
  const section = document.createElement('div');
  section.id = `${id}HistoryContainer`;
  section.className = 'w-full f-full flex-flex-col';

  const header = document.createElement('h2');
  header.className = `text-xl font-semibold ${marginTop} mb-4 text-center`;
  header.textContent = title;

  const content = document.createElement('div');
  content.id = `summaryAndTable${id}Content`;
  content.className = 'flex flex-col w-full';

  const table = document.createElement('div');
  table.id = `${id}Table`;
  table.className = 'w-full lg:w-3/4 overflow-x-auto';

  content.append(table);
  section.append(header);
  section.append(content);

  return section;
}

export function createTableWithHeaders(): HTMLTableElement {
  const table = document.createElement('table');
  table.className = "w-full";
  table.innerHTML = `
    <thead class="sticky top-0 z-10">
      <tr class="bg-gray-200 text-gray-600 uppercase text-md leading-normal">
        <th class="bg-gray-200">DATE</th>
        <th class="bg-gray-200">Player 1</th>
        <th class="bg-gray-200">Player 2</th>
        <th class="bg-gray-200">Duration</th>
      </tr>
    </thead>
  `;
  return table;
}

export function createTournamentTableWithHeaders(): HTMLTableElement {
    const table = document.createElement('table');
    table.className = "w-full";
    table.innerHTML = `
    <thead class="sticky top-0 z-10">
      <tr class="bg-gray-200 text-gray-600 uppercase text-md leading-normal">
        <th class="bg-gray-200">DATE</th>
        <th class="bg-gray-200">Name</th>
      </tr>
    </thead>
  `;
    return table;
}

export function addGameRowsToTable(router: Navigo, table: HTMLTableElement, manager: MultiGamesManager, games: BaseGame[], currentPlayer?: UserData | null, isMultiplayerTable: boolean = false) {
  games.forEach(game => {
    // První řádek s názvy hráčů
    const firstRow = document.createElement('tr');
    firstRow.className = "border border-gray-200 text-center ";
    
    // Datum
    const dateCell = document.createElement('td');
    dateCell.className = "cursor-pointer hover:bg-gray-50 hover:text-shadow-md";
    dateCell.textContent = new Date(game.startedAt).toLocaleString('cs-CZ');
    dateCell.addEventListener('click', () => renderGameDetails(game as MultiGame, manager));
    dateCell.setAttribute('rowspan', '2');
    
    // Player 1
    const player1Cell = document.createElement('td');
    player1Cell.textContent = game.playerOneUsername;
    player1Cell.className = "py-2 break-all";
    
    // Player 2
    const player2Cell = document.createElement('td');
    player2Cell.textContent = game.playerTwoUsername;
    player2Cell.className = "py-2 break-all";
    
    // Přidání click listenerů pro multiplayer tabulku
    if (isMultiplayerTable && 'playerOneId' in game) {
      const multiGame = game as MultiGame;
      
      player1Cell.className += " cursor-pointer hover:bg-gray-50";
      player1Cell.addEventListener('click', () => router.navigate(`${friend_profile_url}/${multiGame.playerOneId}`));
      //player1Cell.addEventListener('click', () => renderSingleFriendProfile(multiGame.playerOneId, multiGame.playerOneUsername));

      
      player2Cell.className += " cursor-pointer hover:bg-gray-50";
      player2Cell.addEventListener('click', () => router.navigate(`${friend_profile_url}/${multiGame.playerTwoId}`));
      //player2Cell.addEventListener('click', () => renderSingleFriendProfile(multiGame.playerTwoId, multiGame.playerTwoUsername));
    }
    
    // Duration
    const durationCell = document.createElement('td');
    durationCell.textContent = manager.formatDuration(game.durationSeconds).toString();
    durationCell.setAttribute('rowspan', '2');

    firstRow.append(dateCell);
    firstRow.append(player1Cell);
    firstRow.append(player2Cell);
    firstRow.append(durationCell);

    // Druhý řádek se skóry
    const secondRow = document.createElement('tr');
    secondRow.className = "border border-gray-200 text-center";

    const scoreCell1 = document.createElement('td');
    const scoreCell2 = document.createElement('td');
    scoreCell1.className = scoreCell2.className = "py-2";
    scoreCell1.textContent = game.playerOneScore.toString();
    scoreCell2.textContent = game.playerTwoScore.toString();

    // Zvýraznění vítěze pro multiplayer hry
    if (currentPlayer && 'winnerId' in game) {
        const multiGame = game as MultiGame;
        const isPlayer1Winner = multiGame.playerOneId === multiGame.winnerId;
        const isPlayer2Winner = multiGame.playerTwoId === multiGame.winnerId;

        if (isPlayer1Winner) {
            const winnerCells = [player1Cell, scoreCell1];
            winnerCells.forEach(cell => cell.classList.add('bg-green-100'));
            player1Cell.classList.add('hover:bg-green-200');
        }
        else if (isPlayer2Winner) {
            const winnerCells = [player2Cell, scoreCell2];
            winnerCells.forEach(cell => cell.classList.add('bg-green-100'));
            player2Cell.classList.add('hover:bg-green-200');
        }
    }
    else if (currentPlayer && 'winnerUsername' in game) {
        const splitGame = game as SplitGame;
        const isPlayer1Winner = splitGame.playerOneUsername === splitGame.winnerUsername;
        const isPlayer2Winner = splitGame.playerTwoUsername === splitGame.winnerUsername;

        if (isPlayer1Winner) {
            const winnerCells = [player1Cell, scoreCell1];
            winnerCells.forEach(cell => cell.classList.add('bg-green-100'));
        } else if (isPlayer2Winner) {
            const winnerCells = [player2Cell, scoreCell2];
            winnerCells.forEach(cell => cell.classList.add('bg-green-100'));
        }
    }

    secondRow.append(scoreCell1);
    secondRow.append(scoreCell2);

    table.append(firstRow);
    table.append(secondRow);
  });
}

export function addRowsToTournamentTable(router: Navigo, table: HTMLTableElement, manager: MultiGamesManager, tournaments: any) {
    tournaments.forEach(tournament => {
        const firstRow = document.createElement('tr');
        firstRow.className = "border border-gray-200 text-center cursor-pointer hover:bg-gray-50 hover:text-shadow-md";
        firstRow.addEventListener('click', () => renderTournamentDetails(tournament.id, manager));

        // Datum
        const dateCell = document.createElement('td');
        dateCell.textContent = dateCell.textContent = new Date(tournament.created + 'Z').toLocaleString('cs-CZ', {  timeZone: 'Europe/Prague' });

        // Tournament name
        const tournamentNameCell = document.createElement('td');
        tournamentNameCell.textContent = tournament.name;
        tournamentNameCell.className = "py-2 break-all";

        firstRow.append(dateCell);
        firstRow.append(tournamentNameCell);

        table.append(firstRow);
    });
}


export function createModalForGameHistory(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.innerHTML = `
       <!-- Modal container bude vykreslen jako "floating box" bez overlaye -->
    <div id="gameModal" class="hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 min-w-[400px]">
        <div id="modalContent" class="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full relative border border-gray-300 cursor-move select-none">
            <!-- Drag handle - neviditelný ale funkční -->
            <div id="dragHandle" class="absolute top-0 left-0 w-full h-8 cursor-move"></div>
            
<!--            <h2 class="text-xl font-normal text-center mb-6 tracking-widest">Detailed game info</h2>-->
            
            <div id="gameDetails" class="space-y-4 text-sm">
            <!-- Dynamický obsah zde -->
            </div>
            
            <div class="flex justify-center mt-6">
                <button id="closeGameModal" class="no-button w-full p-1">close</button>
            </div>
        </div>
    </div>
    `;
    
    // Přidáme draggable funkcionalitu
    const modalContent = modal.querySelector('#modalContent') as HTMLElement;
    const gameModal = modal.querySelector('#gameModal') as HTMLElement;
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Mouse down event
    modalContent.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.id === 'closeGameModal' || target.tagName === 'BUTTON' || target.closest('button')) {
            return;
        }

        isDragging = true;
        modalContent.style.cursor = 'grabbing';

        const rect = gameModal.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;

        // Přepočítáme skutečné souřadnice bez transformace
        const computedStyle = window.getComputedStyle(gameModal);
        const transform = computedStyle.transform;

        if (transform && transform !== 'none') {
            const left = parseFloat(computedStyle.left);
            const top = parseFloat(computedStyle.top);

            // Vypočítáme offset z transformace (translate(-50%, -50%))
            const modalWidth = rect.width;
            const modalHeight = rect.height;

            initialLeft = left - modalWidth / 2;
            initialTop = top - modalHeight / 2;

            // Přepneme modal na pevnou pozici bez transformace
            gameModal.style.transform = 'none';
            gameModal.style.left = `${initialLeft}px`;
            gameModal.style.top = `${initialTop}px`;
            gameModal.style.position = 'absolute';
        } else {
            initialLeft = parseInt(gameModal.style.left) || rect.left;
            initialTop = parseInt(gameModal.style.top) || rect.top;
        }

        e.preventDefault();
        e.stopPropagation();
    });

    // Mouse move event
    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;
        
        // Omezíme pohyb v rámci okna
        const modalRect = gameModal.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Zajistíme, že modal zůstane viditelný
        newLeft = Math.max(10, Math.min(newLeft, windowWidth));
        const minTop = 10;
        const maxTop = windowHeight - 50; // necháme spodní mez, ale neomezíme přehnaně
        newTop = Math.min(Math.max(newTop, minTop), maxTop);
        
        gameModal.style.left = newLeft + 'px';
        gameModal.style.top = newTop + 'px';
        
        e.preventDefault();
    });

    // Mouse up event
    document.addEventListener('mouseup', (e: MouseEvent) => {
        if (isDragging) {
            isDragging = false;
            modalContent.style.cursor = 'move';
        }
    });

    // Přidáme také mouse leave pro případ, že myš opustí okno během draggingu
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            modalContent.style.cursor = 'move';
        }
    });
    
    return modal;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
export function renderGameDetails(data: MultiGame, manager: MultiGamesManager): void {
    const closeBtn = document.getElementById("closeGameModal")!;
    const modal = document.getElementById("gameModal")!;
    const gameDetails = document.getElementById("gameDetails")!;
    
    modal.classList.remove("hidden");
    
    // Reset pozice modalu na střed při otevření
    modal.style.position = 'fixed';
    modal.style.transform = 'none';

    // Umístění do středu s korekcí výšky až po vykreslení
    requestAnimationFrame(() => {
        const rect = modal.getBoundingClientRect();
        const left = (window.innerWidth / 2);
        const top = (window.innerHeight / 2);

        modal.style.left = `${left}px`;
        modal.style.top = `${top}px`;
    });
    
    // Odstranit předchozí event listenery
    const newCloseBtn = closeBtn.cloneNode(true) as HTMLElement;
    closeBtn.parentNode?.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        modal.classList.add("hidden");
    });
    
    data.playerOneAvatar = getAvatar(data.playerOneAvatar);
    data.playerTwoAvatar = getAvatar(data.playerTwoAvatar);
    
    gameDetails.innerHTML = `
        <!-- SCORE sekce -->
        <div class="text-center space-y-3">
            <div class="text-xl font-semibold">SCORE</div>
            
            <div class="flex justify-center items-center space-x-6">
                <div class="flex flex-col items-center space-y-2">
                    <img src="${data.playerOneAvatar}" class="w-16 h-16 rounded-full">
                    <div class="font-semibold text-xl">${data.playerOneUsername}</div>
                    <div class="text-xl font-bold">${data.playerOneScore}</div>
                </div>
                
                <div class="text-2xl mx-8"></div>
                
                <div class="flex flex-col items-center space-y-2">
                    <img src="${data.playerTwoAvatar}" class="w-16 h-16 rounded-full">
                    <div class="font-semibold text-xl">${data.playerTwoUsername}</div>
                    <div class="text-xl font-bold">${data.playerTwoScore}</div>
                </div>
            </div>
        </div>
        
        <!-- Dělidlo -->
        <div class="border-t border-gray-200 my-4"></div>
        
        <!-- Game info sekce -->
        <div class="space-y-3">
            <div class="flex justify-center items-center space-x-2">
                <span class="font-semibold">Game Mode:</span>
                <span>${data.gameMode}</span>
            </div>
            
            <div class="flex justify-center items-center space-x-2">
                <span class="font-semibold">End Reason:</span>
                <span>${data.endReason}</span>
            </div>
        </div>
        
        <!-- Dělidlo -->
        <div class="border-t border-gray-200 my-4"></div>
        
        <!-- PADDLE BOUNCE sekce -->
        <div class="text-center space-y-3">
            <div class="text-lg">PADDLE BOUNCE</div>
            
            <div class="flex justify-center items-center space-x-8">
                <div class="flex flex-col items-center space-y-1">
                    <div class="font-semibold">${data.playerOneUsername}</div>
                    <div class="text-xl font-bold">${data.playerOnePaddleBounce}</div>
                </div>
                
                <div class="text-xl font-bold">:</div>
                
                <div class="flex flex-col items-center space-y-1">
                    <div class="font-semibold">${data.playerTwoUsername}</div>
                    <div class="text-xl font-bold">${data.playerTwoPaddleBounce}</div>
                </div>
            </div>
        </div>
        
        <!-- Dělidlo -->
        <div class="border-t border-gray-200 my-4"></div>
        
        <!-- Časové informace -->
        <div class="space-y-2 text-center">
            <div class="flex justify-center items-center space-x-2">
                <span class="font-semibold">Game Started:</span>
                <span>${new Date(data.startedAt).toLocaleString('cs-CZ')}</span>
            </div>
            
            <div class="flex justify-center items-center space-x-2">
                <span class="font-semibold">Duration:</span>
                <span>${manager.formatDuration(data.durationSeconds).toString()} seconds</span>
            </div>
        </div>
    `;
}

export async function renderTournamentDetails(id: number, manager: MultiGamesManager) {
    const closeBtn = document.getElementById("closeGameModal")!;
    const modal = document.getElementById("gameModal")!;
    const gameDetails = document.getElementById("gameDetails")!;

    modal.classList.remove("hidden");

    // Reset pozice modalu na střed při otevření
    modal.style.position = 'fixed';
    modal.style.transform = 'none';

    // Umístění do středu s korekcí výšky až po vykreslení
    requestAnimationFrame(() => {
        const rect = modal.getBoundingClientRect();
        const left = (window.innerWidth / 2);
        const top = (window.innerHeight / 2);

        modal.style.left = `${left}px`;
        modal.style.top = `${top}px`;
    });

    // Odstranit předchozí event listenery
    const newCloseBtn = closeBtn.cloneNode(true) as HTMLElement;
    closeBtn.parentNode?.replaceChild(newCloseBtn, closeBtn);

    newCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        modal.classList.add("hidden");
    });

    const tournamentStats = await getTournamentStats(id);

    gameDetails.innerHTML = `
        <div class="tournament-container max-w-7xl mx-auto">
    <div id="tournamentLobbyNavigationName" class="flex">
    <h1 class="history-tournament-name text-3xl uppercase md:w-3/5 text-center font-semibolt tracking-[0.1rem] mx-auto mb-5"></h1>
        </div>
<!--        <div class="tournament-header flex w-full items-center">-->
<!--        <div id="tournamentLobbyNavigationDelete" class="w-1/2 flex justify-end">-->
<!--        </div>-->
<!--        </div>-->

<!--        <div class="stats-dashboard mt-4 bg-white rounded-lg p-6 shadow-md">-->
<!--    <h2 class="text-2xl font-semibold tracking-[0.1rem] mx-auto mb-4">Tournament Statistics</h2>-->
<!--    <div class="stats-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">-->
<!--    <div class="history-stat-card bg-gray-100 rounded-lg p-4 text-center shadow-md">-->
<!--    <p class="text-lg font-semibold text-gray-700">Total Games</p>-->
<!--    <p class="text-2xl font-bold text-gray-900">0</p>-->
<!--        </div>-->
<!--        <div class="history-stat-card bg-gray-100 rounded-lg p-4 text-center shadow-md">-->
<!--    <p class="text-lg font-semibold text-gray-700">Games Played</p>-->
<!--    <p class="text-2xl font-bold text-gray-900">0</p>-->
<!--        </div>-->
<!--        </div>-->
<!--        <h3 class="text-xl font-semibold tracking-[0.1rem] mx-auto mb-4 mb-3">Player Rankings</h3>-->
    <div class="rankings-table overflow-x-auto  shadow-md">
    <table class="min-w-full bg-gray-100 rounded-lg">
    <thead>
        <tr>
        <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">#</th>
        <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Player</th>
        <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Wins/Losses</th>
<!--        <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Losses</th>-->
        <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Win Rate</th>
    </tr>
    </thead>
    <tbody class="history1-rankings-body">
        <!-- Rankings will be populated dynamically -->
    </tbody>
    </table>
    </div>
        <h3 class="mt-2"> alias - not linked with account</h3>
        <h3 class="text-green-600 mt-0.5"> alias@username - linked with account</h3>
<!--    </div>-->
    </div>
        `;

    const tournamentName = document.querySelector('.history-tournament-name') as HTMLElement;
    tournamentName.textContent = tournamentStats.name;

    // Populate stats dashboard
    // const totalGames = document.querySelector('.history-stat-card:nth-child(1) p:nth-child(2)') as HTMLElement;
    // const gamesPlayed = document.querySelector('.history-stat-card:nth-child(2) p:nth-child(2)') as HTMLElement;
    // totalGames.textContent = tournamentStats.totalGames.toString();
    // gamesPlayed.textContent = tournamentStats.gamesPlayed.toString();

    const rankingsBody = document.querySelector('.history1-rankings-body') as HTMLElement;
    console.log('Rankings body:', rankingsBody);
    rankingsBody.innerHTML = '';

    async function fetchRealUsername(userId: number): Promise<string> {
        try {
            const response = await fetch(`/api/users/${userId}/username`);
            if (!response.ok) {
                throw new Error('Failed to fetch real username');
            }
            const data = await response.json();
            return data.username || 'Unknown';
        } catch (error) {
            console.error('Error fetching real username:', error);
            return 'Unknown';
        }
    }

    async function populateRankings() {
        for (const [index, player] of tournamentStats.playerRankings.entries()) {
            const row = document.createElement('tr');
            let displayUsername = player.username;
            let usernameClass = 'text-gray-700';

            if (player.linked && player.id !== 0 && player.id !== null) {
                const data = await getPlayerData(player.id);
                if (displayUsername === data?.username) {
                    displayUsername = data?.username;
                } else {
                    displayUsername = `${displayUsername}@${data?.username}`;
                }
                usernameClass = 'text-green-600'; // Different color for linked usernames
            }

            row.innerHTML = `
            <td class="py-2 px-4 text-sm text-gray-700 text-center">${index + 1}</td>
            <td class="py-2 px-4 text-sm ${usernameClass}">${displayUsername}</td>
            <td class="py-2 px-4 text-sm text-gray-700 text-center">${player.wins} / ${player.losses}</td>
            <td class="py-2 px-4 text-sm text-gray-700 text-center">${player.winRate}%</td>
        `;
            rankingsBody.appendChild(row);
        }
    }

    await populateRankings();
}


