import Navigo from "navigo";
import {
    tournament_detail_url,
    api_tournament_get_all_tournaments_url,
    tournament_create_url
} from "../../../config/api_url_config";
import {GetTournaments, GetTournamentsTournament} from "../../../types/tournament/getTournaments";
import {displayError} from "../../../utils/tournament/displayError";

export enum TournamentStatus {
    Pending = 'pending',
    Active = 'active',
    Finished = 'finished'
}


async function getTournaments(tournamentStatus: TournamentStatus): Promise<GetTournamentsTournament[]> {
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

    const data = await response.json() as GetTournaments;
    return data.data.slice(0, 5); // Limit to 5 tournaments
}

// TODO: add interfaces
function createTilesForTournaments(router: Navigo, tilesContainer: HTMLDivElement, tournaments: GetTournamentsTournament[], tournamentsStatus: TournamentStatus) {
    // Create tournament tiles
    let url = '';
    url = tournament_detail_url;


    tournaments.forEach(tournament => {
        const tile = document.createElement('div');
        tile.className = 'flex flex-row md:flex-row items-center justify-between w-full h-18 md:h-18 bg-gray-100 rounded-lg p-4 md:p-4 cursor-pointer hover:bg-gray-200 shadow-md';
        tile.innerHTML = `
            <h3 class="text-lg md:text-lg font-semibold text-left truncate flex-1">${tournament.name}</h3>
            <p class="text-sm md:text-sm text-gray-600 ml-4 md:ml-4 mt-2 md:mt-0">${new Date(tournament.created).toLocaleString()}</p>
        `;
        tile.addEventListener('click', () => {
            router.navigate(`${url}/${tournament.id}`);
        });
        tilesContainer.appendChild(tile);
    });
    // Hint if max number of tournaments reached
    if (tournaments.length >= 5 && tournamentsStatus === TournamentStatus.Active)
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
        addTile.className = 'tech-button flex items-center justify-center w-full h-10';
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

export async function renderTournamentLobbyContent(parentElement: HTMLElement, router: Navigo) {
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
            Tournaments lobby
        </h2>

        <!-- Tournament Tiles Section -->
        <div id="tournamentTilesContainer" class="flex flex-row items-start justify-center w-full mt-8 max-w-7xl mx-auto">
        
            <div id="tournamentTilesContainerActiveTournaments" class="flex flex-col items-center w-1/2 mx-2 bg-white rounded-lg p-6 shadow-md">
                <h2 class="tournament-name text-2xl pb-6 uppercase w-4/5 md:w-3/5 text-center border-b-1 border-gray-200 tracking-[0.2rem] mx-auto">
                    Active
                </h2>
                <div id="activeTournamentTiles" class="w-full">
                </div>
            </div>
            
            
            <div id="tournamentTilesContainerEndedTournaments" class="flex flex-col items-center w-1/2 mx-2 bg-white rounded-lg p-6 shadow-md">
                <h2 class="tournament-name text-2xl pb-6 uppercase w-4/5 md:w-3/5 text-center border-b-1 border-gray-200 tracking-[0.2rem] mx-auto">
                    Finished
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

        console.log(activeTournaments);

        createTilesForTournaments(router, tilesContainerActiveTournaments, activeTournaments, TournamentStatus.Active);
        createTilesForTournaments(router, tilesContainerEndedTournaments, endedTournaments, TournamentStatus.Finished);

        tournamentLobby.querySelector('#activeTournamentTiles')?.append(tilesContainerActiveTournaments);
        tournamentLobby.querySelector('#endedTournamentTiles')?.append(tilesContainerEndedTournaments);
        parentElement.append(tournamentLobby);
    } catch (error: any) {
        console.error('Error rendering tournament content:', error);

        displayError(error, parentElement);
    }
}
