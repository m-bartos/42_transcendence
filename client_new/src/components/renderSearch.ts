
import iconSearchUrl from '/src/assets/icons/searchicon.svg';
import { validateUsername } from './utils/security/securityUtils';
import { api_get_user_info_by_username_url, api_add_friend_url } from '../config/api_url_config';
import { getAvatar } from '../api/getUserInfo';
import { FriendsManager, friendsManager, Friend } from './utils/friendUtils/friends';
import { AuthManager } from '../api/user';
// ==================== TYPY A KONSTANTY ====================

interface UserFound {
    id: number;
    username: string;
    avatar: string;
}

export const SEARCH_OUTPUT_FIELD_ID = 'searchOutputField';
export const SEARCH_INPUT_ID = 'searchInput';

let searchedValue: string = '';

// ==================== HLAVNÍ RENDEROVÁNÍ ====================



export function renderSearch(idOfTheOtherUser?: number): void {
    const parentElement = document.getElementById('contentForProfileOptions');
    if (!parentElement) {
        console.error('Parent element not found');
        return;
    }

    parentElement.innerHTML = '';
    const searchContainer = createSearchContainer();
    parentElement.append(searchContainer);

    // Přidání event listeneru pro submit formuláře
    const searchForm = document.getElementById('searchForm') as HTMLFormElement;
    
    if (searchForm) {
        searchForm.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            const searchInput = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement;
            if (searchInput) {
                searchUsers(searchInput.value, idOfTheOtherUser);
            }
        });
    }
}

// ==================== VYTVÁŘENÍ UI ELEMENTŮ ====================

/**
 * Vytvoří hlavní kontejner pro vyhledávání
 */
function createSearchContainer(): HTMLDivElement {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'w-full flex flex-col p-4';

    const header = createSearchHeader();
    const content = createSearchContent();

    searchContainer.append(header, content);
    return searchContainer;
}

/**
 * Vytvoří hlavičku s názvem stránky
 */
function createSearchHeader(): HTMLHeadingElement {
    const searchHeader = document.createElement('h2');
    searchHeader.className = 'text-xl mt-4 mb-12 text-center';
    searchHeader.textContent = 'You can search for other players here.';
    return searchHeader;
}

/**
 * Vytvoří obsah stránky (input pole a výsledky)
 */
function createSearchContent(): HTMLDivElement {
    const searchContent = document.createElement('div');
    searchContent.className = 'w-full flex flex-col lg:flex-row items-start justify-center';

    const searchForm = createSearchForm();
    const outputField = createSearchOutputField();

    searchContent.append(searchForm, outputField);
    return searchContent;
}

/**
 * Vytvoří formulář pro vyhledávání
 */
function createSearchForm(): HTMLFormElement {
    const searchForm = document.createElement('form');
    searchForm.id = 'searchForm';
    searchForm.className = 'w-full lg:w-1/3 px-24 lg:px-0 flex flex-col items-center justify-center';

    const searchWrapper = createSearchWrapper();
    const searchButton = createSearchButton();

    searchForm.append(searchWrapper, searchButton);
    return searchForm;
}

/**
 * Vytvoří pole pro zadávání vyhledávacího dotazu
 */
function createSearchInputField(): HTMLDivElement {
    const searchInputField = document.createElement('div');
    searchInputField.className = 'w-full lg:w-1/3 px-24 lg:px-0 flex flex-col items-center justify-center';

    const searchWrapper = createSearchWrapper();
    const searchButton = createSearchButton();

    searchInputField.append(searchWrapper, searchButton);
    return searchInputField;
}

/**
 * Vytvoří wrapper pro vyhledávací input s ikonou
 */
function createSearchWrapper(): HTMLDivElement {
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'w-full flex items-center justify-center border border-gray-400 bg-white rounded-lg p-3 mb-4';

    const searchIcon = document.createElement('img');
    searchIcon.src = iconSearchUrl;
    searchIcon.className = 'w-6 h-6 mr-2';

    const searchInput = document.createElement('input');
    searchInput.id = SEARCH_INPUT_ID;
    searchInput.type = 'text';
    searchInput.placeholder = 'Search player by name';
    searchInput.className = 'outline-none w-full';

    searchWrapper.append(searchIcon, searchInput);
    return searchWrapper;
}

/**
 * Vytvoří tlačítko pro vyhledávání
 */
function createSearchButton(): HTMLButtonElement {
    const searchButton = document.createElement('button');
    searchButton.id = 'searchButton';
    searchButton.type = 'submit';
    searchButton.className = 'tech-button w-full p-2';
    searchButton.textContent = 'Search';
    return searchButton;
}

/**
 * Vytvoří pole pro zobrazení výsledků vyhledávání
 */
function createSearchOutputField(): HTMLDivElement {
    const searchOutputField = document.createElement('div');
    searchOutputField.id = SEARCH_OUTPUT_FIELD_ID;
    searchOutputField.className = 'w-full lg:w-2/3 px-8 text-center';
    return searchOutputField;
}

// ==================== VYHLEDÁVÁNÍ UŽIVATELŮ ====================

/**
 * Vyhledá uživatele podle jména
 * @param name - Jméno uživatele k vyhledání
 * @param idOfTheOtherUser - ID jiného uživatele (volitelné)
 */
export async function searchUsers(name: string, idOfTheOtherUser?: number): Promise<void> {
    // Validace vstupu
    if (!isValidSearchInput(name)) {
        return;
    }

    // Získání informací o uživateli
    const userInfo = await getUserInfo(idOfTheOtherUser);
    if (!userInfo) {
        return;
    }

    searchedValue = name;

    try {
        // Získání seznamu přátel a vyhledání uživatelů
        const friends = await friendsManager.fetchFriends(true);
        const friendsIds = friends.map((friend: Friend) => friend.friend_id);
        
        const allUsersFound = await fetchUsersByName(name);
        
        // Zobrazení výsledků
        displaySearchResults(allUsersFound, friendsIds, userInfo.id);
        
        // Vyčištění input pole
        clearSearchInput();
        
    } catch (error) {
        handleSearchError(error);
    }
}

/**
 * Validuje vstup pro vyhledávání
 */
function isValidSearchInput(name: string): boolean {
    if (!validateUsername(name) || name.length === 0) {
        console.error('Invalid username:', name);
        return false;
    }
    return true;
}

/**
 * Získá informace o aktuálním uživateli
 */
async function getUserInfo(idOfTheOtherUser?: number): Promise<{ id: number } | null> {
    const loggedUser = AuthManager.getUser();
    if (!loggedUser) {
        console.error('User not authenticated');
        return null;
    }

    const userId = idOfTheOtherUser || loggedUser.id;
    console.log('Searching for users for the logged user:', userId);
    
    return { id: userId };
}

/**
 * Načte uživatele podle jména z API
 */
async function fetchUsersByName(name: string): Promise<UserFound[]> {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(api_get_user_info_by_username_url + `${name}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}

/**
 * Zobrazí výsledky vyhledávání
 */
function displaySearchResults(allUsersFound: UserFound[], friendsIds: number[], currentUserId: number): void {
    const searchOutputField = document.getElementById(SEARCH_OUTPUT_FIELD_ID);
    if (!searchOutputField) {
        console.error('Search output field not found');
        return;
    }

    searchOutputField.innerHTML = '';

    if (allUsersFound.length === 0) {
        searchOutputField.textContent = 'No users found';
        return;
    }

    // Filtrování a zobrazení uživatelů
    const filteredUsers = allUsersFound.filter(user => {
        if (user.id === currentUserId) {
            console.warn('Skipping logged user in search results:', user.username);
            return false;
        }
        return true;
    });

    filteredUsers.forEach(user => {
        const userDiv = createUserElement(user, friendsIds);
        searchOutputField.append(userDiv);
    });
}

/**
 * Vyčistí vyhledávací input
 */
function clearSearchInput(): void {
    const searchInput = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement;
    if (searchInput) {
        searchInput.value = '';
    }
}

/**
 * Zpracuje chybu při vyhledávání
 */
function handleSearchError(error: any): void {
    console.error('Error searching users:', error);
    const searchOutputField = document.getElementById(SEARCH_OUTPUT_FIELD_ID);
    if (searchOutputField) {
        searchOutputField.textContent = 'Error searching users';
    }
}

// ==================== VYTVÁŘENÍ UŽIVATELSKÝCH ELEMENTŮ ====================

/**
 * Vytvoří element pro zobrazení jedného uživatele
 */
function createUserElement(user: UserFound, friendIds: number[]): HTMLDivElement {
    const userDiv = document.createElement('div');
    userDiv.className = 'flex items-center justify-between p-2 px-4 mb-2 rounded-lg shadow-md mt-8 lg:mt-0';

    const avatar = createUserAvatar(user);
    const username = createUsernameElement(user);
    const actionElement = createUserActionElement(user, friendIds);

    userDiv.append(avatar, username, actionElement);
    return userDiv;
}

/**
 * Vytvoří avatar uživatele
 */
function createUserAvatar(user: UserFound): HTMLImageElement {
    const avatar = document.createElement('img');
    avatar.src = getAvatar(user.avatar);
    avatar.alt = `${user.username}'s avatar`;
    avatar.className = 'w-16 h-16 rounded-full mr-4';
    return avatar;
}

/**
 * Vytvoří element s uživatelským jménem
 */
function createUsernameElement(user: UserFound): HTMLDivElement {
    const username = document.createElement('div');
    username.textContent = user.username;
    username.className = 'text-lg w-full text-start rounded-md p-6 break-all'
    return username;
}

/**
 * Vytvoří akční element (tlačítko Follow nebo text Already following)
 */
function createUserActionElement(user: UserFound, friendIds: number[]): HTMLElement {
    if (userIsFriend(user.id, friendIds)) {
        return createAlreadyFollowingElement();
    } else {
        return createFollowButton(user.id);
    }
}

/**
 * Vytvoří tlačítko Follow
 */
function createFollowButton(userId: number): HTMLButtonElement {
    const actionButton = document.createElement('button');
    actionButton.className = 'tech-button py-1 px-4 ml-4';
    actionButton.textContent = 'Follow';
    actionButton.addEventListener('click', () => addFriend(userId));
    return actionButton;
}

/**
 * Vytvoří element "Already following"
 */
function createAlreadyFollowingElement(): HTMLSpanElement {
    const alreadyFollowing = document.createElement('span');
    alreadyFollowing.textContent = 'already following';
    alreadyFollowing.className = 'ml-4';
    return alreadyFollowing;
}

// ==================== POMOCNÉ FUNKCE ====================

/**
 * Zkontroluje, zda je uživatel již mezi přáteli
 */
function userIsFriend(userId: number, friendsIds: number[]): boolean {
    if (!friendsIds || friendsIds.length === 0) {
        return false;
    }
    return friendsIds.includes(userId);
}

/**
 * Přidá uživatele mezi přátele
 */
async function addFriend(userId: number): Promise<void> {
    const token = localStorage.getItem('jwt');
    if (!token) {
        console.error('No JWT token found');
        return;
    }

    try {
        const response = await fetch(api_add_friend_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "friend_id": userId
            })
        });

        if (!response.ok) {
            throw new Error(`Error adding friend: ${response.statusText}`);
        }

        // Obnovení seznamu přátel a výsledků vyhledávání
        await friendsManager.fetchFriends(true);
        await searchUsers(searchedValue);
        
        console.log('Friend added successfully');
        
    } catch (error) {
        console.error('Error adding friend:', error);
    }
}