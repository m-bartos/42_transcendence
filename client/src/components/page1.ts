export function renderPage1(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bg-white p-6 rounded-lg shadow-md';
    
    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Vítejte na domovské stránce</h2>
        <p class="text-gray-700">Toto je první stránka naší SPA aplikace. Navigujte mezi stránkami pomocí odkazů v navigačním menu.</p>
    `;
    console.log("page 1 loaded");
    return container;
}