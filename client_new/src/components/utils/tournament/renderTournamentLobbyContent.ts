import {renderSplitKeyboardContent} from "../splitKeyboard/splitKeyboardUtils";
import Navigo from "navigo";
import {
    active_tournament_url,
    api_getUserInfo_url,
    api_tournament_get_all_tournaments_url,
    base_url, finished_tournament_url,
    home_page_url, tournament_create_url
} from "../../../config/api_url_config";

export enum TournamentStatus {
    Pending = 'pending',
    Active = 'active',
    Finished = 'finished'
}


async function getTournaments(tournamentStatus: TournamentStatus) {
    // Fetch tournaments
    const requestOptions = {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    };
    const response = await fetch(api_tournament_get_all_tournaments_url + `?status=${tournamentStatus}`, requestOptions);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.slice(0, 5); // Limit to 5 tournaments
}

// TODO: add interfaces
function createTilesForTournaments(router: Navigo, tilesContainer: HTMLDivElement, tournaments, tournamentsStatus: TournamentStatus) {
    // Create tournament tiles
    let url = '';
    if (tournamentsStatus === TournamentStatus.Active) {
        url = active_tournament_url;
    } else
    {
        url = finished_tournament_url;
    }


    tournaments.forEach(tournament => {
        const tile = document.createElement('div');
        tile.className = 'flex flex-row items-center justify-center w-120 h-18 bg-gray-100 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-200';
        tile.innerHTML = `
            <h3 class="text-lg font-semibold text-left truncate w-full">${tournament.name}</h3>
            <p class="text-sm text-gray-600">${new Date(tournament.created).toLocaleString()}</p>
        `;
        tile.addEventListener('click', () => {
            router.navigate(`${url}/${tournament.id}`);
        });
        tilesContainer.appendChild(tile);
    });
    // Hint if max number of tournaments reached
    if (tournaments.length >= 5)
    {
        const hint = document.createElement('div');
        hint.className = 'flex mt-12 text-xl px-8 text-center';
        hint.innerHTML = `<p class="text-sm text-gray-600">Hint: Maximum number of tournaments reached. Finish or delete one to be able to add new one!</p>`
        // TODO: is it correct to append it to tilesContainer?
        tilesContainer.appendChild(hint);
        return;
    }

    // Create "Add New Tournament" tile
    if (tournamentsStatus === TournamentStatus.Active)
    {
        const addTile = document.createElement('div');
        addTile.className = 'tech-button flex items-center justify-center w-120 h-10';
        // addTile.className = 'flex items-center justify-center w-120 h-10 bg-blue-500 border border-blue-600 rounded-lg cursor-pointer hover:bg-blue-600';
        addTile.innerHTML = `
            <span class="text-3xl font-bold text-center mb-1.5">+</span>
        `;
        addTile.addEventListener('click', () => {
            router.navigate(tournament_create_url);
        });
        tilesContainer.appendChild(addTile);
    }
}

export async function renderTournamentLobbyContent(parentElement: HTMLElement, router: any) {
    if (!parentElement) {
        console.error('Parent element not found');
        return;
    }

    const tournamentLobby = document.createElement('div') as HTMLDivElement;
    tournamentLobby.id = 'tournamentLobby';
    tournamentLobby.className = "w-full min-h-max flex flex-col items-center mt-6 mb-auto min-w-[500px]";
    tournamentLobby.innerHTML = `
        <!-- Header Section -->
        <h2 class="text-2xl pb-6 uppercase w-4/5 md:w-3/5 text-center border-b-1 border-gray-200 tracking-[1rem] mx-auto">
            Tournament lobby
        </h2>

        <!-- Tournament Tiles Section -->
        <div id="tournamentTilesContainer" class="flex flex-row items-start justify-center w-full mt-8">
            <div id="tournamentTilesContainerActiveTournaments" class="flex flex-col items-center justify-center w-1/2">
                <h2 class="tournament-name text-3xl font-bold text-gray-800">
                    Active Tournaments
                </h2>
                <div id="activeTournamentTiles" class="w-full">
                </div>
            </div>
            
            
            <div id="tournamentTilesContainerEndedTournaments" class="flex flex-col items-center justify-start w-1/2">
                <h2 class="tournament-name text-3xl font-bold text-gray-800">
                    Ended Tournaments
                </h2>
                <div id="endedTournamentTiles" class="w-full">
                </div>
            </div>
        </div>
    `;

    // Create tournament tiles section
    const tilesContainerActiveTournaments = document.createElement('div');
    const tilesContainerEndedTournaments = document.createElement('div');
    tilesContainerActiveTournaments.className = 'flex flex-col justify-center items-center gap-4 mt-6 w-full overflow-x-auto';
    tilesContainerEndedTournaments.className = 'flex flex-col justify-center items-center gap-4 mt-6 w-full overflow-x-auto';

    try {
        const activeTournaments = await getTournaments(TournamentStatus.Active);
        const endedTournaments = await getTournaments(TournamentStatus.Finished);

        createTilesForTournaments(router, tilesContainerActiveTournaments, activeTournaments, TournamentStatus.Active);
        createTilesForTournaments(router, tilesContainerEndedTournaments, endedTournaments, TournamentStatus.Finished);

        tournamentLobby.querySelector('#activeTournamentTiles')?.append(tilesContainerActiveTournaments);
        tournamentLobby.querySelector('#endedTournamentTiles')?.append(tilesContainerEndedTournaments);
        parentElement.append(tournamentLobby);
    } catch (error) {
        console.error('Error rendering tournament content:', error);
    }
}
