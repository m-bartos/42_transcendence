import { getFriends } from '../api.js';
import { navigate } from '../router.js';

export function renderFriends(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bg-white/50 p-6 rounded-lg shadow-md';
    container.id = 'friendsContainer';
    
    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Seznam přátel</h2>
        <div id="loading" class="text-gray-600">Načítání seznamu přátel...</div>
        <div id="friendsList" class="mt-4 hidden">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-100/80">
                        <th class="border p-2 text-left">ID</th>
                        <th class="border p-2 text-left">Jméno</th>
                        <th class="border p-2 text-left">Status</th>
                        <th class="border p-2 text-center">Action</th>
                    </tr>
                </thead>
                <tbody id="friendsTableBody">
                </tbody>
            </table>
        </div>
        <div id="errorContainer" class="mt-4 text-red-500/80 hidden"></div>
    `;
    
    // Načtení dat o přátelích
    (async () => {
        const loadingElement = container.querySelector('#loading');
        const friendsListElement = container.querySelector('#friendsList');
        const friendsTableBody = container.querySelector('#friendsTableBody');
        const errorContainer = container.querySelector('#errorContainer');
        
        if (loadingElement && friendsListElement && friendsTableBody && errorContainer) {
            try {
                
                const friends = await getFriends();
                friends.forEach((friend) => {
                    const tr = document.createElement('tr');
                    
                    tr.className = 'hover:bg-gray-100/80 transition-colors duration-200';
                    tr.innerHTML = `
                        <td class="border p-2">${friend.id}</td>
                        <td class="border p-2">${friend.name}</td>
                        <td class="border p-2">${friend.status}</td>
                        <td class="border p-2 text-center"><button class="bg-red-500 hover:ring-2 ring-red-200 ring-inset text-white px-3 py-1 rounded cursor-pointer detailButton">Show details</button></td>
                    `;
                    friendsTableBody.appendChild(tr);
                    const detailButton = tr.querySelector('.detailButton');
                    if (detailButton) {
                        detailButton.addEventListener('click', () => {
                            // Použití funkce z router.ts pro navigaci na detail přítele
                            navigate(`/friends/${friend.id}`);
                        });
                    }
                });

                loadingElement.classList.add('hidden');
                friendsListElement.classList.remove('hidden');
            } catch (error) {
                loadingElement.classList.add('hidden');
                errorContainer.textContent = error instanceof Error ? error.message : 'Nepodařilo se načíst seznam přátel';
                errorContainer.classList.remove('hidden');
            }
        }
    })(); 
    
    return container;
}