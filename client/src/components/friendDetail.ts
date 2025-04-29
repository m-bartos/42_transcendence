import { getFriendById } from '../api.js';
import { navigate } from '../router.js';

export async function showDetailsFunction(id: number): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'bg-white/50 p-6 rounded-lg shadow-md';
    container.id = 'friendDetailContainer';

    // Zobrazíme načítací indikátor
    container.innerHTML = `
        <div id="loading" class="text-gray-600">Načítání detailu přítele...</div>
        <div id="detailContent" class="hidden"></div>
        <div id="errorContainer" class="mt-4 text-red-500/80 hidden"></div>
    `;

    const loadingElement = container.querySelector('#loading');
    const detailContent = container.querySelector('#detailContent');
    const errorContainer = container.querySelector('#errorContainer');

    if (loadingElement && detailContent && errorContainer) {
        try {
            const friend = await getFriendById(id);
            
            if (!friend) {
                throw new Error('Přítel nebyl nalezen');
            }

            // Vytvoříme obsah detailu
            detailContent.innerHTML = `
                <div class="grid grid-cols-4 gap-4 border-1 border-gray-400 items-center">
                    <div><strong>ID:</strong> ${friend.id}</div>
                    <div><strong>Name:</strong> ${friend.name}</div>
                    <div><strong>Status:</strong> ${friend.status}</div>
                    <button id="backButton" class="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 my-auto rounded-md border-1 border-gray-800">Zpět</button>
                </div>
            `;

            const backButton = detailContent.querySelector('#backButton');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    navigate('/friends');
                });
            }

            // Skryjeme načítání a zobrazíme obsah
            loadingElement.classList.add('hidden');
            detailContent.classList.remove('hidden');
        } catch (error) {
            loadingElement.classList.add('hidden');
            errorContainer.textContent = error instanceof Error ? error.message : 'Nepodařilo se načíst detail přítele';
            errorContainer.classList.remove('hidden');
        }
    }

    return container;
}