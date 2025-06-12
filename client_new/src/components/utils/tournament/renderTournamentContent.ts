import Navigo from "navigo";
import {
    api_tournament_delete_tournament_url,
    api_tournament_get_all_tournaments_url, api_tournament_get_stats_url, api_tournament_get_tournament_url,
    game_multiplayer_url,
    home_page_url,
    split_keyboard_url, tournament_game_url,
    tournament_lobby_url
} from "../../../config/api_url_config";
import {TournamentStatus} from "./renderTournamentLobbyContent";


interface PlayerRanking {
    username: string;
    wins: number;
    losses: number;
    winRate: number;
}

interface TournamentStats {
    totalGames: number;
    gamesPlayed: number;
    gamesPending: number;
    playerRankings: PlayerRanking[];
}

interface TournamentData {
    id: number;
    status: string;
    name: string;
    created: string;
    games: any[];
}

async function getTournamentById(tournamentId:number) {
    // Fetch tournaments
    const requestOptions = {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    };

    console.log(api_tournament_get_tournament_url + tournamentId);
    const response = await fetch(api_tournament_get_tournament_url + tournamentId, requestOptions);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}


async function getTournamentStats(tournamentId: number): Promise<any> {
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

    const data = await response.json();

    console.log(data);

    return data;
}

// Function to handle tournament deletion
async function deleteTournament(router: Navigo, tournamentId: number) {
    console.log(`Deleting tournament with ID: ${tournamentId}`);
    // Placeholder for delete logic (e.g., API call)
    try {
        const response = await fetch(`${api_tournament_delete_tournament_url}/${tournamentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            }
        })
        if (response.ok) {
            console.log('Tournament deleted successfully');
            router.navigate(tournament_lobby_url);
        } else {
            console.error('Failed to delete tournament');
        }
    } catch(error) {
        console.error('Error deleting tournament:', error);
    }
    // For now, navigate to lobby after logging
    router.navigate(tournament_lobby_url);
}

// TODO: Delete button should show popup if you really want to delete the tournament
export async function renderTournamentContent(app: HTMLElement, router: Navigo, tournamentIdStr: string, status: TournamentStatus) {
    const tournamentId = parseInt(tournamentIdStr);
    if (isNaN(tournamentId)) {
        router.navigate(home_page_url);
    }


    document.title = "Tournament";
    const mainPageContent = document.createElement('div') as HTMLDivElement;
    mainPageContent.className = "w-full min-w-[500px] min-h-screen mt-6 px-4 sm:px-6 lg:px-8";
    mainPageContent.innerHTML = `
    <div class="tournament-container max-w-7xl mx-auto">

    <div class="tournament-header flex w-full items-center">
        <div id="tournamentLobbyNavigationBackToLobby" class="w-1/3 flex justify-left">
            <button class="tech-button bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors" onclick="window.location.href='${tournament_lobby_url}'">Back to lobby</button>
        </div>
        <div id="tournamentLobbyNavigationName" class="w-1/3 flex justify-center">
            <h1 class="tournament-name text-3xl font-bold text-gray-800">Default Tournament</h1>
        </div>
        <div id="tournamentLobbyNavigationDelete" class="w-1/3 flex justify-end">
            ${status !== TournamentStatus.Finished ? `
            <button class="delete-tournament-button bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition-colors">Delete tournament</button>
            ` : ''}
        </div>
    </div>

        <div class="stats-dashboard mt-4 bg-white rounded-lg p-6 shadow-md">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Tournament Statistics</h2>
            <div class="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="stat-card bg-gray-100 rounded-lg p-4 text-center">
                    <p class="text-lg font-semibold text-gray-700">Total Games</p>
                    <p class="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div class="stat-card bg-gray-100 rounded-lg p-4 text-center">
                    <p class="text-lg font-semibold text-gray-700">Games Played</p>
                    <p class="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div class="stat-card bg-gray-100 rounded-lg p-4 text-center">
                    <p class="text-lg font-semibold text-gray-700">Games Pending</p>
                    <p class="text-2xl font-bold text-gray-900">0</p>
                </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Player Rankings</h3>
            <div class="rankings-table overflow-x-auto">
                <table class="min-w-full bg-gray-100 rounded-lg">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Rank</th>
                            <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Player</th>
                            <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Wins</th>
                            <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Losses</th>
                            <th class="py-2 px-4 text-left text-sm font-medium text-gray-600">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody class="rankings-body">
                        <!-- Rankings will be populated dynamically -->
                    </tbody>
                </table>
            </div>
        </div>

        <div class="games-dashboard mt-4 mb-8 bg-white rounded-lg p-6 shadow-md">
            <div class="games-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
                <!-- Game tiles will be populated dynamically -->
            </div>
        </div>
        
    </div>
    `;
    app.append(mainPageContent);

    // Attach event listener to the delete button
    const deleteButton = document.querySelector('.delete-tournament-button') as HTMLButtonElement;
    if (deleteButton) {
        deleteButton.addEventListener('click', () => deleteTournament(router, tournamentId));
    }

    // Function to render tournament data
    function renderTournament(data: any, statsData: any) {
        // Set tournament name
        const tournamentName = document.querySelector('.tournament-name') as HTMLElement;
        tournamentName.textContent = data.data.name;

        // Get games grid
        const gamesGrid = document.querySelector('.games-grid') as HTMLElement;
        gamesGrid.innerHTML = ''; // Clear example content

        // Render each game tile
        // TODO: seperate the innerHTML to more divs
        data.data.games.forEach((game: any) => {
            const gameTile = document.createElement('div');
            gameTile.className = 'game-tile bg-gray-100 rounded-lg p-6 shadow-md flex flex-col justify-between';
            gameTile.innerHTML = `
                <div class="game-info mb-4 flex flex-col items-center">
                    <div class="game-info-players flex w-full justify-between mb-2">
                        <p class="text-2xl font-medium text-center text-gray-700">${game.playerOneUsername}</p>
                        <p class="text-2xl font-medium text-center text-gray-700">:</p>
                        <p class="text-2xl font-medium text-center text-gray-700">${game.playerTwoUsername}</p>
                    </div>
                    <p class="text-sm text-gray-500">${game.status === 'pending' ? 'ready to play' : game.status}</p>
                </div>
                <div class="game-play-button-or-score flex justify-center items-center">
                    ${game.status === 'pending' ? `<button class="play-button bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">PLAY</button>` :
                    game.status === 'finished' ? `<span class="finished-text text-black-500 font-medium text-align:center text-2xl py-2 px-4">${game.playerOneScore} : ${game.playerTwoScore}</span>` : ''}
                </div>
            `;
            gamesGrid.appendChild(gameTile);
            // Attach event listener to the play button if it exists
            if (game.status === 'pending') {
                const playButton = gameTile.querySelector('.play-button') as HTMLButtonElement;
                if (playButton) {
                    playButton.addEventListener('click', () => {
                        router.navigate(`${tournament_game_url}/${tournamentIdStr}/${game.gameId}`);
                    });
                }
            }
        });

        // Populate stats dashboard
        const totalGames = document.querySelector('.stat-card:nth-child(1) p:nth-child(2)') as HTMLElement;
        const gamesPlayed = document.querySelector('.stat-card:nth-child(2) p:nth-child(2)') as HTMLElement;
        const gamesPending = document.querySelector('.stat-card:nth-child(3) p:nth-child(2)') as HTMLElement;
        totalGames.textContent = statsData.data.totalGames.toString();
        gamesPlayed.textContent = statsData.data.gamesPlayed.toString();
        gamesPending.textContent = statsData.data.gamesPending.toString();

        const rankingsBody = document.querySelector('.rankings-body') as HTMLElement;
        rankingsBody.innerHTML = '';
        statsData.data.playerRankings.forEach((player: PlayerRanking, index: number) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 text-sm text-gray-700">${index + 1}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${player.username}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${player.wins}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${player.losses}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${player.winRate}%</td>
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
        router.navigate(home_page_url);
    }
}