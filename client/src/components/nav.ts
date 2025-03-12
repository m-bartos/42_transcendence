import { logout } from '../auth.js';

export function renderNav(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'bg-gray-600 p-4 rounded-lg shadow-md';
    
    nav.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-white text-xl font-bold"><a href="/" data-link>Transcendence</a></h1>
            </div>
            <div class="space-x-4">
                <a href="/" data-link class="font-semibold text-white opacity-75 hover:opacity-100">Home</a>
                <a href="/game" data-link class="font-semibold text-white opacity-75 hover:opacity-100">Game</a>
                <a href="/friends" data-link class="font-semibold text-white opacity-75 hover:opacity-100">Friends</a>
                <button id="logoutBtn" class="bg-red-500 hover:ring-2 ring-red-200 ring-inset text-white px-3 py-1 rounded cursor-pointer">Odhlásit</button>
            </div>
        </div>
    `;
    
    // Přidání event listeneru na tlačítko odhlášení
    setTimeout(() => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    }, 0);
    
    return nav;
}