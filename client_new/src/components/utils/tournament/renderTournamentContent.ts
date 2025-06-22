import Navigo from "navigo";
import {
    api_tournament_delete_tournament_url,
    api_tournament_get_stats_url,
    api_tournament_get_tournament_url,
    home_page_url,
    tournament_game_url,
    tournament_lobby_url
} from "../../../config/api_url_config";
import { TournamentStatus } from "./renderTournamentLobbyContent";
import {
    GetTournamentStats,
    GetTournamentStatsData,
    GetTournamentStatsDataPlayerRanking
} from "../../../types/tournament/getTournamentStats";
import {
    GetTournamentByIdData,
    GetTournamentByIdDataGame,
    GetTournamentByIdResponse
} from "../../../types/tournament/getTournamentById";
import {displayError} from "../../../utils/tournament/displayError";

async function getTournamentById(tournamentId: number): Promise<GetTournamentByIdData> {
    const requestOptions = {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    };
    const response = await fetch(`${api_tournament_get_tournament_url}${tournamentId}`, requestOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseJson = await response.json() as GetTournamentByIdResponse;

    return responseJson.data as GetTournamentByIdData;
    // TODO: extract data and assign proper types
}

export async function getTournamentStats(tournamentId: number): Promise<GetTournamentStatsData> {
    const requestOptions = {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    };
    const response = await fetch(`${api_tournament_get_stats_url}/${tournamentId}`, requestOptions);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const body = await response.json() as GetTournamentStats;

    return body.data as GetTournamentStatsData;
}

async function deleteTournament(router: Navigo, tournamentId: number) {
    try {
        const response = await fetch(`${api_tournament_delete_tournament_url}/${tournamentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            }
        });
        if (response.ok) {
            console.log('Tournament deleted successfully');
            router.navigate(tournament_lobby_url);
        } else {
            console.error('Failed to delete tournament');
        }
    } catch (error) {
        console.error('Error deleting tournament:', error);
    }
}

export async function renderTournamentContent(app: HTMLElement, router: Navigo, tournamentIdStr: string) {
    const tournamentId = parseInt(tournamentIdStr);
    if (isNaN(tournamentId)) {
        router.navigate(home_page_url);
        return;
    }

    document.title = "";
    const mainPageContent = document.createElement('div') as HTMLDivElement;
    mainPageContent.className = "w-full min-w-[500px] min-h-screen mt-6 px-4 sm:px-6 lg:px-8";
    mainPageContent.innerHTML = `
    <div class="tournament-container max-w-7xl mx-auto">
        <div id="tournamentLobbyNavigationName" class="flex">
                <h1 class="tournament-name text-3xl uppercase md:w-3/5 text-center font-semibolt tracking-[0.1rem] mx-auto"></h1>
        </div>
        <div class="tournament-header flex w-full items-center">
            <div id="tournamentLobbyNavigationBackToLobby" class="w-1/2 flex justify-left">
                <button class="tech-button px-2 lg:px-8 py-1" onclick="window.location.href='${tournament_lobby_url}'">Lobby</button>
            </div>
            <div id="tournamentLobbyNavigationDelete" class="w-1/2 flex justify-end">
            </div>
        </div>

        <div class="stats-dashboard mt-4 bg-white rounded-lg p-6 shadow-md">
            <h2 class="text-2xl font-semibold tracking-[0.1rem] mx-auto mb-4">Tournament Statistics</h2>
            <div class="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="stat-card bg-gray-100 rounded-lg p-4 text-center shadow-md">
                    <p class="text-lg font-semibold text-gray-700">Total Games</p>
                    <p class="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div class="stat-card bg-gray-100 rounded-lg p-4 text-center shadow-md">
                    <p class="text-lg font-semibold text-gray-700">Games Played</p>
                    <p class="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div class="stat-card bg-gray-100 rounded-lg p-4 text-center shadow-md">
                    <p class="text-lg font-semibold text-gray-700">Games Pending</p>
                    <p class="text-2xl font-bold text-gray-900">0</p>
                </div>
            </div>
            <h3 class="text-xl font-semibold tracking-[0.1rem] mx-auto mb-4 mb-3">Player Rankings</h3>
            <div class="rankings-table overflow-x-auto  shadow-md">
                <table class="min-w-full bg-gray-100 rounded-lg">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Rank</th>
                            <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Player</th>
                            <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Wins</th>
                            <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Losses</th>
                            <th class="py-2 px-4 text-center text-sm font-medium text-gray-600">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody class="rankings-body">
                        <!-- Rankings will be populated dynamically -->
                    </tbody>
                </table>
            </div>
        </div>

        <div class="games-dashboard mt-4 mb-4 bg-white rounded-lg p-6 shadow-md">
            <h2 class="text-2xl font-semibold tracking-[0.1rem] mx-auto mb-4">Games</h2>
            <div class = "w-full flex items-center mb-4">
                <h3 class="text-l text-gray-800 mx-5">Filter: </h3>
                <div class="player-filters flex flex-wrap gap-4 mx-5">
                    <!-- Player checkboxes will be populated dynamically -->
                </div>
            <button class="clear-filters no-button px-2 lg:px-8 py-1">Clear</button>
            </div>

            <div class="games-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Game tiles will be populated dynamically -->
            </div>
            <div class="no-games-message hidden text-center text-gray-600 mt-4">
                <p>No games match the selected filters.</p>
            </div>
        </div>
    </div>
    `;
    app.append(mainPageContent);

    // Attach event listener to the delete button

    // State to track selected players
    let selectedPlayers: string[] = [];

    // Function to render tournament data
    function renderTournament(data: GetTournamentByIdData, statsData: GetTournamentStatsData) {

        if (data.status === TournamentStatus.Active) {
            const deleteDiv = document.getElementById('tournamentLobbyNavigationDelete');
            if (deleteDiv) {
                // Create button element directly instead of using innerHTML
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-tournament-button no-button px-2 lg:px-8 py-1';
                deleteButton.textContent = 'Delete';

                // Clear existing content and append new button
                deleteDiv.innerHTML = '';
                deleteDiv.appendChild(deleteButton);

                // Add event listener
                deleteButton.addEventListener('click', () => deleteTournament(router, tournamentId));
            }
        }
        // Set tournament name
        const tournamentName = document.querySelector('.tournament-name') as HTMLElement;
        tournamentName.textContent = data.name;

        // Populate player filters
        const playerFilters = document.querySelector('.player-filters') as HTMLElement;
        playerFilters.innerHTML = '';
        const players = Array.from(new Set(statsData.playerRankings.map((p: GetTournamentStatsDataPlayerRanking) => p.username)));
        players.sort((a, b) => a.localeCompare(b)); // Sort alphabetically
        players.forEach((username: string) => {
            const filterItem = document.createElement('div');
            filterItem.className = 'flex items-center';
            filterItem.innerHTML = `
                <input type="checkbox" id="filter-${username}" value="${username}" class="mr-2">
                <label for="filter-${username}" class="text-sm text-gray-700">${username}</label>
            `;
            playerFilters.appendChild(filterItem);
        });

        // Attach event listeners to checkboxes
        const checkboxes = playerFilters.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLInputElement;
                if (target.checked) {
                    selectedPlayers.push(target.value);
                } else {
                    selectedPlayers = selectedPlayers.filter(p => p !== target.value);
                }
                renderGames(data.games); // Re-render games with updated filter
            });
        });

        // Attach event listener to clear filters button
        const clearFiltersButton = document.querySelector('.clear-filters') as HTMLButtonElement;
        clearFiltersButton.addEventListener('click', () => {
            selectedPlayers = [];
            checkboxes.forEach(cb => (cb as HTMLInputElement).checked = false);
            renderGames(data.games);
        });

        // Function to render games based on filter
        function renderGames(games: GetTournamentByIdDataGame[]) {
            const gamesGrid = document.querySelector('.games-grid') as HTMLElement;
            const noGamesMessage = document.querySelector('.no-games-message') as HTMLElement;
            gamesGrid.innerHTML = '';

            let filteredGames: GetTournamentByIdDataGame[] = [];

            if (selectedPlayers.length === 0) {
                filteredGames = games; // Show all games if no filter
            } else if (selectedPlayers.length === 1) {
                filteredGames = games.filter(game =>
                    (selectedPlayers.includes(game.playerOneUsername) || selectedPlayers.includes(game.playerTwoUsername))
                );
            } else if (selectedPlayers.length === 2) {
                // Show only games where both players are the selected two
                filteredGames = games.filter(game =>
                    (selectedPlayers.includes(game.playerOneUsername) && selectedPlayers.includes(game.playerTwoUsername)) ||
                    (selectedPlayers.includes(game.playerTwoUsername) && selectedPlayers.includes(game.playerOneUsername))
                );
            } else {
                // No games for more than 2 players or less than 2
                filteredGames = [];
            }

            if (filteredGames.length === 0) {
                noGamesMessage.classList.remove('hidden');
            } else {
                noGamesMessage.classList.add('hidden');
            }

            filteredGames.forEach((game: GetTournamentByIdDataGame) => {
                const gameTile = document.createElement('div');
                gameTile.className = 'game-tile bg-gray-100 rounded-lg p-6 shadow-md flex flex-col justify-between';
                gameTile.innerHTML = `
                    <div class="game-info mb-2 flex flex-col items-center">
                        <div class="game-info-players flex w-full flex-col sm:flex-row">
                            <p class="text-2xl sm:text-xl font-medium text-start text-gray-700 w-full sm:w-1/3">${game.playerOneUsername}</p>
                            <p class="text-2xl sm:text-xl font-medium text-center text-gray-700 w-full sm:w-1/3">vs</p>
                            <p class="text-2xl sm:text-xl font-medium text-end text-gray-700 w-full sm:w-1/3">${game.playerTwoUsername}</p>
                        </div>
                        <p class="text-sm text-gray-500 mt-2">${game.status === 'pending' ? 'ready to play' : game.status}</p>
                    </div>
                    <div class="game-play-button-or-score flex justify-center items-center">
                        ${game.status === 'pending' ? `<button class="play-button tech-button px-2 lg:px-8 py-1">PLAY</button>` :
                    game.status === 'finished' ? `<span class="finished-text text-black-500 font-medium text-align:center text-2xl py-2 px-4">${game.playerOneScore} : ${game.playerTwoScore}</span>` : ''}
                    </div>
                `;
                gamesGrid.appendChild(gameTile);

                if (game.status === 'pending') {
                    const playButton = gameTile.querySelector('.play-button') as HTMLButtonElement;
                    if (playButton) {
                        playButton.addEventListener('click', () => {
                            router.navigate(`${tournament_game_url}/${tournamentIdStr}/${game.gameId}`);
                        });
                    }
                }
            });
        }

        // Initial render of games
        renderGames(data.games);

        // Populate stats dashboard
        const totalGames = document.querySelector('.stat-card:nth-child(1) p:nth-child(2)') as HTMLElement;
        const gamesPlayed = document.querySelector('.stat-card:nth-child(2) p:nth-child(2)') as HTMLElement;
        const gamesPending = document.querySelector('.stat-card:nth-child(3) p:nth-child(2)') as HTMLElement;
        totalGames.textContent = statsData.totalGames.toString();
        gamesPlayed.textContent = statsData.gamesPlayed.toString();
        gamesPending.textContent = statsData.gamesPending.toString();

        const rankingsBody = document.querySelector('.rankings-body') as HTMLElement;
        rankingsBody.innerHTML = '';
        statsData.playerRankings.forEach((player: GetTournamentStatsDataPlayerRanking, index: number) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 text-sm text-gray-700 text-center">${index + 1}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${player.username}</td>
                <td class="py-2 px-4 text-sm text-gray-700 text-center">${player.wins}</td>
                <td class="py-2 px-4 text-sm text-gray-700 text-center">${player.losses}</td>
                <td class="py-2 px-4 text-sm text-gray-700 text-center">${player.winRate}%</td>
            `;
            rankingsBody.appendChild(row);
        });
    }

    // Get data and render them
    try {
        const [tournamentData, statsData] = await Promise.all([
            getTournamentById(tournamentId),
            getTournamentStats(tournamentId)
        ]);

        renderTournament(tournamentData, statsData);
    } catch (error) {
        console.error('Error fetching tournament data:', error);
        displayError(error, mainPageContent);
    }
}