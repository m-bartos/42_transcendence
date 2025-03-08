import { initRouter } from './router.js';
import { checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app') as HTMLDivElement;
    
    // Kontrola, zda je uživatel přihlášen
    if (!checkAuth()) {
        // Pokud není přihlášen, zobrazíme přihlašovací formulář
        import('./components/login.js').then(module => {
            appContainer.innerHTML = '';
            appContainer.appendChild(module.renderLogin());
        });
    } else {
        // Pokud je přihlášen, inicializujeme router
        initRouter(appContainer);
    }
});