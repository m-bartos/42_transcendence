export function renderGame(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bg-white p-6 rounded-lg shadow-md';
    
    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Druhá stránka</h2>
        <p class="text-gray-700">Toto je druhá stránka naší SPA aplikace.</p>
        <div class="mt-4 p-4 bg-gray-100 rounded">
            <p>Zde může být další obsah...</p>
        </div>
    `;
    
    return container;
}