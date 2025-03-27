import {renderUser } from './renderUser.js';

export function renderPage1(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bg-white p-6 rounded-lg shadow-md';
    
    container.innerHTML = `
        <div id="mainContainer" class="flex flex-row bg-white text-gray-800 p-2">
            
        </div>
    `;
    setTimeout(() => {
        const userElement = document.getElementById('mainContainer');
        if (userElement) {
            userElement.appendChild(renderUser());
        }
    }, 0);
    console.log("page 1 loaded");
    
    return container;
}

