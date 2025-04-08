import { logout } from '../auth.js';


export function renderNav(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'bg-gray-600 p-4 rounded-lg shadow-md';
    
    nav.innerHTML = `
        <div class="flex justify-center py-4 md:py-0 md:justify-between items-center ">
            <div class="hidden md:inline-flex">
                <h1 class=" text-white text-xl  font-bold"><a href="/" data-link>Transcendence</a></h1>
            </div>
            <div class="flex flex-col md:flex-row text-3xl md:text-base  items-center">
                <a href="/" data-link class="font-semibold text-white opacity-75 hover:opacity-100 text-center m-auto md:mr-10 py-2 md:py-0">Home</a>
                <a href="/game" data-link class="font-semibold text-white opacity-75 hover:opacity-100 m-auto md:mr-10 py-2 md:py-0">Game</a>
                <a href="/friends" data-link class="font-semibold text-white opacity-75 hover:opacity-100 m-auto md:mr-10 py-2 md:py-0">Friends</a>
                <button id="logoutBtn" class=" bg-gray-500 hover:bg-red-800 hover:ring-2 ring-gray-700 ring-inset text-white px-3 py-1 rounded cursor-pointer mt-2 mr-2 md:mt-0">Log Out</button>
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