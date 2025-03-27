import { initRouter } from './router.js';
import { checkAuth } from './auth.js';
import { cleanDataAndReload } from './auth.js';
import { refreshTokenRegular } from './components/tokenRefresher.js';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app') as HTMLDivElement;
    
    // Kontrola, zda je uživatel přihlášen
    console.log("checkAuth kontrolujeme, jestli ej uzivatel prihlasen");
    if (!checkAuth()) {
        // Pokud není přihlášen, zobrazíme přihlašovací formulář
        import('./components/login.js').then(module => {
            appContainer.innerHTML = '';
            appContainer.appendChild(module.renderLogin());
        });
    } else {
        // Pokud je přihlášen, inicializujeme router
        document.addEventListener('visibilitychange', () => {
            if(!document.hidden) {
                console.log('Kontrolujeme prihlaseni po navratu na stranku');
                if (!checkAuth()) {
                    window.alert('Byli jste odhlášeni');
                    cleanDataAndReload();
                }
            }
        });

        refreshTokenRegular();
        
        initRouter(appContainer);
    }
});