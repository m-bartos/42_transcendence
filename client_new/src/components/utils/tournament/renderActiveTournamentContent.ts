import Navigo from "navigo";
import {
    api_tournament_delete_tournament_url,
    api_tournament_get_all_tournaments_url, api_tournament_get_tournament_url,
    game_multiplayer_url,
    home_page_url,
    split_keyboard_url,
    tournament_lobby_url
} from "../../../config/api_url_config";

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
export async function renderActiveTournamentContent(app: HTMLElement, router: Navigo, tournamentIdStr: string) {
    const tournamentId = parseInt(tournamentIdStr);
    if (isNaN(tournamentId)) {
        router.navigate(home_page_url);
    }


    document.title = "Tournament";
    const mainPageContent = document.createElement('div') as HTMLDivElement;
    mainPageContent.className = "w-full min-w-[500px] min-h-screen mt-6 px-4 sm:px-6 lg:px-8";
    mainPageContent.innerHTML = `
    <div class="tournament-container max-w-7xl mx-auto">
        <div class="tournament-header mb-6 flex justify-between items-center">
            <h1 class="tournament-name text-3xl font-bold text-gray-800">Default Tournament</h1>
            <button class="delete-tournament-button bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition-colors">Delete</button>
        </div>

        <div class="games-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Example game tile, to be populated dynamically -->
            <div class="game-tile bg-white rounded-lg p-6 shadow-md flex flex-col justify-between">
                <div class="game-info mb-4">
                    <div class="game-info-players flex justify-between">
                        <p class="text-lg font-medium text-gray-700">Player1</p>
                        <p class="text-lg font-medium text-gray-700">:</p>
                        <p class="text-lg font-medium text-gray-700">Player2</p>
                    </div>
                    <p class="text-sm text-gray-500">Status: pending</p>
                </div>
                <button class="play-button bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors" onclick="window.location.href='${game_multiplayer_url}/a9b79993-cb14-4331-ae16-773d151ee868'">PLAY</button>
            </div>
            <!-- More game tiles will be added here dynamically -->
        </div>
        
                
        <div id="tournamentLobbyNavigation" class="w-full mt-12 flex flex-row justify-between">
            <button class="tech-button" onclick="window.location.href='${tournament_lobby_url}'">Back to lobby</button>
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
    function renderTournament(data: any) {
        // Set tournament name
        const tournamentName = document.querySelector('.tournament-name') as HTMLElement;
        tournamentName.textContent = data.data.name;

        // Get games grid
        const gamesGrid = document.querySelector('.games-grid') as HTMLElement;
        gamesGrid.innerHTML = ''; // Clear example content

        // Render each game tile
        data.data.games.forEach((game: any) => {
            const gameTile = document.createElement('div');
            gameTile.className = 'game-tile bg-white rounded-lg p-6 shadow-md flex flex-col justify-between';
            gameTile.innerHTML = `
                <div class="game-info mb-4 flex flex-col items-center">
                    <div class="game-info-players flex w-3/4 justify-between mb-2">
                        <p class="text-2xl font-medium text-gray-700">${game.playerOneUsername}</p>
                        <p class="text-2xl font-medium text-gray-700">:</p>
                        <p class="text-2xl font-medium text-gray-700">${game.playerTwoUsername}</p>
                    </div>
                    <p class="text-sm text-gray-500">${game.status === 'pending' ? 'ready to play' : game.status}</p>
                </div>
                ${game.status === 'pending' ? `<button class="play-button bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors" onclick="window.location.href='${game_multiplayer_url}/${game.gameId}'">PLAY</button>` : ''}
            `;
            gamesGrid.appendChild(gameTile);
        });
    }

    // Get data and render them
    try {
        const tournamentData = await getTournamentById(tournamentId);
        renderTournament(tournamentData);
    } catch (error) {
        console.error('Error fetching tournament data:', error);
        router.navigate(home_page_url);
    }
}