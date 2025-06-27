import Navigo from "navigo";
import {
    tournament_detail_url,
    api_tournament_create_tournament_url,
    api_tournament_get_tournament_url,
    game_multiplayer_url,
    home_page_url,
    split_keyboard_url,
    tournament_lobby_url,
    api_user_link_account_url,
} from "../../../config/api_url_config";

// Function to validate alias or tournament name
function validateNameOrAlias(name: string, field: string): string | null {
    // Check if the input is only whitespace
    if (/^\s*$/.test(name)) {
        return `${field} cannot be empty or contain only spaces.`;
    }
    // Length validation
    if (name.length < 3 || name.length > (field === 'Tournament name' ? 20 : 10)) {
        return `${field} must be between 3 and ${field === 'Tournament name' ? 20 : 10} characters.`;
    }
    // Character validation
    const nameRegex = /^[a-zA-Z0-9_\- ]+$/;
    if (!nameRegex.test(name)) {
        return `${field} can only contain letters, numbers, spaces, underscores, and hyphens.`;
    }
    return null;
}

export async function renderCreateTournamentContent(app: HTMLElement, router: Navigo) {
    document.title = "Create Tournament";

    // Map to store the linked ID for each alias input element
    const linkedUsersData = new Map<HTMLInputElement, { id: number, verifiedUsername: string, aliasAtLinkTime: string }>();

    // Reference to the input element currently being linked via the modal
    let currentlyLinkingInput: HTMLInputElement | null = null;

    // Function to handle tournament creation
    async function createTournament(name: string, players: { inputElement: HTMLInputElement, value: string }[]) {
        try {
            // Prepare the array of players to send to the backend
            const playersToSend = players.map(player => {
                const linkedData = linkedUsersData.get(player.inputElement);
                if (linkedData) {
                    const alias = linkedData.aliasAtLinkTime ? linkedData.aliasAtLinkTime : linkedData.verifiedUsername;
                    return {
                        alias: alias.trim(),
                        linked: true,
                        id: linkedData.id,
                    };
                } else {
                    return {
                        alias: player.value.trim(),
                        linked: false,
                        id: 0,
                    };
                }
            });

            const response = await fetch(api_tournament_create_tournament_url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    players: playersToSend
                })
            });

            if (response.ok) {
                const data = await response.json();
                const tournamentId = data.data?.id;
                if (tournamentId) {
                    router.navigate(`${tournament_detail_url}/${tournamentId}`);
                } else {
                    throw new Error('No tournament ID returned');
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to create tournament';
                console.error(errorMessage);
                const errorDiv = document.querySelector('.error-message') as HTMLElement;
                if (errorDiv) {
                    errorDiv.textContent = errorMessage;
                    errorDiv.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            const errorDiv = document.querySelector('.error-message') as HTMLElement;
            if (errorDiv) {
                errorDiv.textContent = 'Error creating tournament';
                errorDiv.classList.remove('hidden');
            }
        }
    }

    // Main page content HTML
    const mainPageContent = document.createElement('div') as HTMLDivElement;
    mainPageContent.className = "w-full min-h-max flex flex-col items-center mt-6 mb-auto min-w-[500px]";
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
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
            </div>
            <div>
                <label class="block text-lg font-medium text-gray-700">Player Aliases</label>
                <div id="alias-fields" class="mt-2 space-y-2">
                    <!-- Alias fields will be populated dynamically -->
                </div>
            </div>
            <div class="flex justify-between mt-12">
                <button class="cancel-button no-button px-2 py-1">Cancel</button>
                <button class="create-tournament-button yes-button px-2 py-1">Create Tournament</button>
            </div>
        </div>
    </div>

    <!-- User Linking Modal -->
    <div id="link-user-modal" class="hidden fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
            <h2 class="text-xl font-bold mb-4 text-gray-800">Link Registered User</h2>
            <div class="modal-error-message hidden text-red-500 text-sm mb-4"></div>
            <div class="mb-4">
                <label for="modal-username" class="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" id="modal-username" class="h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Enter username" required>
            </div>
            <div class="mb-6">
                <label for="modal-password" class="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" id="modal-password" class="h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Enter password" required>
            </div>
            <div class="flex justify-between space-x-3">
                <button id="modal-cancel-button" class="no-button px-1 py-1">Cancel</button>
                <button id="modal-link-button" class="yes-button px-1 py-1">Link</button>
            </div>
        </div>
    </div>
    `;
    app.append(mainPageContent);

    // Get references to modal elements
    const linkUserModal = document.querySelector('#link-user-modal') as HTMLElement;
    const modalUsernameInput = document.querySelector('#modal-username') as HTMLInputElement;
    const modalPasswordInput = document.querySelector('#modal-password') as HTMLInputElement;
    const modalCancelButton = document.querySelector('#modal-cancel-button') as HTMLButtonElement;
    const modalLinkButton = document.querySelector('#modal-link-button') as HTMLButtonElement;
    const modalErrorMessage = document.querySelector('.modal-error-message') as HTMLElement;

    // Function to handle the actual linking logic with backend
    async function linkAccount() {
        const username = modalUsernameInput.value.trim();
        const password = modalPasswordInput.value.trim();

        if (!username || !password) {
            modalErrorMessage.textContent = 'Please enter both username and password.';
            modalErrorMessage.classList.remove('hidden');
            return;
        }

        modalLinkButton.disabled = true; // Disable button to prevent multiple clicks
        modalLinkButton.textContent = 'Linking...';

        try {
            const response = await fetch(api_user_link_account_url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                const userId = data.data?.id;
                const verifiedUsername = data.data?.username;

                if (userId && verifiedUsername && currentlyLinkingInput) {
                    // Check if this ID is already linked to another input field
                    const isIdAlreadyLinked = Array.from(linkedUsersData.values()).some(
                        (linkedData) => linkedData.id === userId
                    );

                    if (isIdAlreadyLinked) {
                        modalErrorMessage.textContent = `This registered user (ID: ${userId}) is already linked to another player slot.`;
                        modalErrorMessage.classList.remove('hidden');
                        return; // Prevent linking the same ID multiple times
                    }

                    let aliasAtLinkTime = currentlyLinkingInput.value.trim(); // The alias currently in the input
                    if (aliasAtLinkTime.length === 0) {
                        aliasAtLinkTime = verifiedUsername;
                    }
                    // Update the Map with the linked data
                    linkedUsersData.set(currentlyLinkingInput, { id: userId, verifiedUsername: verifiedUsername, aliasAtLinkTime: aliasAtLinkTime });

                    // Visually indicate the input is linked and display alias@username
                    currentlyLinkingInput.value = `${aliasAtLinkTime} as ${verifiedUsername}`;
                    currentlyLinkingInput.readOnly = true; // Make it read-only
                    currentlyLinkingInput.classList.add('border-green-500', 'bg-green-50'); // Add styling
                    currentlyLinkingInput.classList.remove('border-gray-300', 'focus:border-green-500', 'focus:ring-green-500');

                    // Find and update the "link" button next to this input
                    const linkButton = currentlyLinkingInput.nextElementSibling as HTMLButtonElement;
                    if (linkButton && linkButton.classList.contains('link-alias-button')) {
                        linkButton.textContent = 'Unlink';
                        linkButton.classList.remove('tech-button');
                        linkButton.classList.add('no-button');
                        linkButton.disabled = false; // Unlink button should always be enabled
                    }

                    modalErrorMessage.classList.add('hidden'); // Clear any previous errors
                    linkUserModal.classList.add('hidden'); // Hide the modal
                } else {
                    throw new Error('Invalid response from server: missing ID or username.');
                }
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to link user. Invalid credentials.';
                modalErrorMessage.textContent = errorMessage;
                modalErrorMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error linking user:', error);
            modalErrorMessage.textContent = 'An error occurred during linking.';
            modalErrorMessage.classList.remove('hidden');
        } finally {
            modalLinkButton.disabled = false; // Re-enable button
            modalLinkButton.textContent = 'Link';
        }
    }

    // Event listeners for modal buttons
    modalCancelButton.addEventListener('click', () => {
        linkUserModal.classList.add('hidden');
        modalErrorMessage.classList.add('hidden');
        modalUsernameInput.value = '';
        modalPasswordInput.value = '';
        currentlyLinkingInput = null; // Clear the reference
    });

    modalLinkButton.addEventListener('click', linkAccount);

    // Function to update alias fields based on player count
    function updateAliasFields(count: number) {
        const aliasFields = document.querySelector('#alias-fields') as HTMLElement;
        aliasFields.innerHTML = ''; // Clear existing fields
        linkedUsersData.clear(); // Clear linked data map when fields are re-rendered

        for (let i = 0; i < count; i++) {
            const playerFieldContainer = document.createElement('div');
            playerFieldContainer.className = "flex items-center space-x-2 mb-5"; // Use flexbox for layout

            const input = document.createElement('input');
            input.type = 'text';
            input.className = "alias-input block w-1/2 h-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm flex-grow";
            input.placeholder = `Enter alias ${i + 1}`;
            input.required = true;

            // Function to update the state of the link/unlink button
            const updateLinkButtonState = (button: HTMLButtonElement, inputElement: HTMLInputElement) => {
                if (linkedUsersData.has(inputElement)) {
                    // It's linked, show "Unlink"
                    button.textContent = 'Unlink';
                    button.classList.remove('tech-button');
                    button.classList.add('no-button');
                    button.disabled = false;
                } else {
                    // It's not linked, show "Link User"
                    button.textContent = 'Link User';
                    button.classList.remove('no-button');
                    button.classList.add('tech-button');
                    button.disabled = false;
                }
            };

            const linkUnlinkButton = document.createElement('button');
            linkUnlinkButton.type = 'button'; // Important for buttons inside forms not to submit
            linkUnlinkButton.className = "link-alias-button tech-button px-2 py-1.5";

            linkUnlinkButton.addEventListener('click', () => {
                if (linkedUsersData.has(input)) {
                    // Currently linked, so perform unlink action
                    const linkedData = linkedUsersData.get(input);
                    if (linkedData) {
                        input.value = linkedData.aliasAtLinkTime; // Revert to original alias
                    }
                    linkedUsersData.delete(input); // Remove from map
                    input.readOnly = false; // Make it editable again
                    input.classList.remove('border-green-500', 'bg-green-50'); // Remove styling
                    input.classList.add('border-gray-300'); // Add original styling
                    updateLinkButtonState(linkUnlinkButton, input); // Update button to "Link"
                } else {
                    // Not linked, open modal for linking
                    currentlyLinkingInput = input; // Store reference to the input being linked
                    modalUsernameInput.value = input.value; // Pre-fill modal username with current alias
                    modalPasswordInput.value = ''; // Clear password field
                    modalErrorMessage.classList.add('hidden'); // Clear modal error message
                    linkUserModal.classList.remove('hidden'); // Show the modal
                }
            });

            // When the input value changes, if it was previously linked, remove the linking.
            input.addEventListener('input', () => {
                if (linkedUsersData.has(input)) {
                    linkedUsersData.delete(input); // Remove link from map
                    input.readOnly = false; // Make it editable again
                    input.classList.remove('border-green-500', 'bg-green-50'); // Remove styling
                    input.classList.add('border-gray-300'); // Add original styling
                    updateLinkButtonState(linkUnlinkButton, input); // Update button to "Link"
                }
            });

            playerFieldContainer.appendChild(input);
            playerFieldContainer.appendChild(linkUnlinkButton);
            aliasFields.appendChild(playerFieldContainer);
            updateLinkButtonState(linkUnlinkButton, input); // Initialize button state
        }
    }

    // Initialize with 3 alias fields
    updateAliasFields(3);

    // Event listener for player count change
    const playerCountSelect = document.querySelector('#player-count') as HTMLSelectElement;
    playerCountSelect.addEventListener('change', (event) => {
        const count = parseInt((event.target as HTMLSelectElement).value);
        updateAliasFields(count);
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
        const aliasInputs = document.querySelectorAll('.alias-input') as NodeListOf<HTMLInputElement>;
        const name = nameInput.value.trim();
        const errorDiv = document.querySelector('.error-message') as HTMLElement;

        // Validate tournament name
        const tournamentNameError = validateNameOrAlias(name, 'Tournament name');
        if (tournamentNameError) {
            if (errorDiv) {
                errorDiv.textContent = tournamentNameError;
                errorDiv.classList.remove('hidden');
            }
            return;
        }

        // Create an array of objects containing the input element and its current value
        const players: { inputElement: HTMLInputElement, value: string }[] = Array.from(aliasInputs).map(input => ({
            inputElement: input,
            value: input.value.trim()
        }));

        // Validate aliases
        for (const player of players) {
            // Skip validation for linked inputs, as their value includes " as username"
            if (!linkedUsersData.has(player.inputElement)) {
                const aliasError = validateNameOrAlias(player.value, 'Player alias');
                if (aliasError) {
                    if (errorDiv) {
                        errorDiv.textContent = aliasError;
                        errorDiv.classList.remove('hidden');
                    }
                    return;
                }
            }
        }

        // Validate for unique visible aliases
        const uniqueAliases = new Set<string>();
        for (const player of players) {
            if (uniqueAliases.has(player.value)) {
                if (errorDiv) {
                    errorDiv.textContent = 'All player aliases must be unique.';
                    errorDiv.classList.remove('hidden');
                }
                return;
            }
            uniqueAliases.add(player.value);
        }

        // Clear previous error messages if validation passes
        if (errorDiv) {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
        }

        // Pass the input elements along with their values to createTournament
        createTournament(name, players);
    });
}