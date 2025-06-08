import Navigo from "navigo";
import {
    active_tournament_url,
    api_tournament_create_tournament_url,
    api_tournament_get_tournament_url,
    game_multiplayer_url,
    home_page_url,
    split_keyboard_url,
    tournament_lobby_url
} from "../../../config/api_url_config";

export async function renderCreateTournamentContent(app: HTMLElement, router: Navigo) {
    document.title = "Create Tournament";

    // Function to handle tournament creation
    async function createTournament(name: string, usernames: string[]) {
        try {
            const response = await fetch(api_tournament_create_tournament_url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    usernames
                })
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Tournament created successfully:', data);
                // Assuming the response includes the new tournament ID
                const tournamentId = data.data?.id;
                if (tournamentId) {
                    console.log('Tournament created successfully:', tournamentId);
                    router.navigate(`${active_tournament_url}/${tournamentId}`);
                } else {
                    throw new Error('No tournament ID returned');
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to create tournament';
                console.error(errorMessage);
                const errorDiv = document.querySelector('.error-message') as HTMLElement;
                errorDiv.textContent = errorMessage;
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            const errorDiv = document.querySelector('.error-message') as HTMLElement;
            errorDiv.textContent = 'Error creating tournament';
            errorDiv.classList.remove('hidden');
        }
    }

    //TODO: add check on fields (min, max length of usernames and tournament name)

    const mainPageContent = document.createElement('div') as HTMLDivElement;
    mainPageContent.className = "w-full min-h-max flex flex-col items-center mt-6 mb-auto min-w-[500px]";
    //mainPageContent.className = "w-full min-w-[500px] min-h-[200px] mt-6 px-4 sm:px-6 lg:px-8";-->
    mainPageContent.innerHTML = `
    <div class="container w-full">
        <h1 class="text-2xl pb-6 uppercase w-4/5 md:w-3/5 text-center border-b-1 border-gray-200 tracking-[1rem] mx-auto">Create New Tournament</h1> 
    </div>
        
    <div class="tournament-create-container w-4/5 max-w-4xl mx-auto">
        <div class="error-message hidden text-red-500 text-center mb-4"></div>
        <div class="form-container bg-white rounded-lg p-6 shadow-md mt-6">
            <div class="mb-12">
                <label for="tournament-name" class="block text-lg font-medium text-gray-700">Tournament Name</label>
                <input type="text" id="tournament-name" maxlength="20" class="h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Enter tournament name" required>
            </div>
            <div class="mb-12 flex items-center justify-between">
                <label for="player-count" class="block text-lg font-medium text-gray-700">Number of Players</label>
                <select id="player-count" class="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </div>
            <div class="mb-16">
                <label class="block text-lg font-medium text-gray-700">Player Usernames</label>
                <div id="username-fields" class="mt-2 space-y-2">
                    <!-- Username fields will be populated dynamically -->
                    <input type="text" class="username-input block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm mt-2" minlength="3" maxlength="20" placeholder="Enter username" required>
                    <input type="text" class="username-input block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm mt-2" minlength="3" maxlength="20" placeholder="Enter username" required>
                    <input type="text" class="username-input block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm mt-2" minlength="3" maxlength="20" placeholder="Enter username" required>
                </div>
            </div>
            <div class="flex justify-between mt-12">
                <button class="cancel-button bg-gray-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">Cancel</button>
                <button class="create-tournament-button bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">Create Tournament</button>
            </div>
        </div>
    </div>
    `;
    app.append(mainPageContent);

    // Function to update username fields based on player count
    function updateUsernameFields(count: number) {
        const usernameFields = document.querySelector('#username-fields') as HTMLElement;
        usernameFields.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = "username-input block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm mt-2";
            input.placeholder = `Enter username ${i + 1}`;
            input.required = true;
            usernameFields.appendChild(input);
        }
    }

    // Initialize with 3 username fields
    updateUsernameFields(3);

    // Event listener for player count change
    const playerCountSelect = document.querySelector('#player-count') as HTMLSelectElement;
    playerCountSelect.addEventListener('change', (event) => {
        const count = parseInt((event.target as HTMLSelectElement).value);
        updateUsernameFields(count);
    });

    // Event listener for cancel button
    const cancelButton = document.querySelector('.cancel-button') as HTMLButtonElement;
    cancelButton.addEventListener('click', () => {
        router.navigate(tournament_lobby_url);
    });

    // Event listener for create tournament button
    const createButton = document.querySelector('.create-tournament-button') as HTMLButtonElement;
    createButton.addEventListener('click', () => {
        const nameInput = document.querySelector('#tournament-name') as HTMLInputElement;
        const usernameInputs = document.querySelectorAll('.username-input') as NodeListOf<HTMLInputElement>;
        const name = nameInput.value.trim();
        const usernames = Array.from(usernameInputs).map(input => input.value.trim());

        // Validate inputs
        // TODO: make validation in line with backend
        if (usernames.some(username => !username)) {
            const errorDiv = document.querySelector('.error-message') as HTMLElement;
            errorDiv.textContent = 'All usernames must be filled';
            errorDiv.classList.remove('hidden');
            return;
        }
        if (new Set(usernames).size !== usernames.length) {
            const errorDiv = document.querySelector('.error-message') as HTMLElement;
            errorDiv.textContent = 'Usernames must be unique';
            errorDiv.classList.remove('hidden');
            return;
        }

        createTournament(name, usernames);
    });
}