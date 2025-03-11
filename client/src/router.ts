import { checkAuth } from './auth.js';

type Route = {
    path: string;
    component: () => Promise<{ default: () => HTMLElement }>;
};

const routes: Route[] = [
    {
        path: '/',
        component: () => import('./components/page1.js').then(m => ({ default: m.renderPage1 }))
    },
    {
        path: '/game',
        component: () => import('./components/game.js').then(m => ({ default: m.renderGame }))
    },
    {
        path: '/friends',
        component: () => import('./components/friends.js').then(m => ({ default: m.renderFriends }))
    }
];

// Proměnná pro sledování, jestli zrovna probíhá navigace
let isNavigating = false;

export function initRouter(container: HTMLElement): void {
    // Vykreslení navigace
    import('./components/nav.js').then(module => {
        const nav = module.renderNav();
        container.innerHTML = '';
        container.appendChild(nav);
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'mt-6';
        container.appendChild(contentContainer);
        
        // Funkce pro změnu stránky
        const navigateTo = (path: string) => {
            if (isNavigating) return; // Zabraňuje dvojitému načtení
            isNavigating = true;
            
            if (!checkAuth()) {
                window.location.href = '/';
                isNavigating = false;
                return;
            }
            
            const route = routes.find(r => r.path === path);
            if (route) {
                route.component().then(module => {
                    contentContainer.innerHTML = '';
                    contentContainer.appendChild(module.default());
                    
                    // Důležitá změna: Nastavujeme hash pouze pokud se aktuální hash liší od požadované cesty
                    // Tím zabráníme triggeru události hashchange, když na hash klikneme přímo
                    if (window.location.hash !== '#' + path) {
                        // Dočasně odstraníme event listener pro hashchange, abychom předešli dvojitému načtení
                        window.removeEventListener('hashchange', hashChangeHandler);
                        window.location.hash = path;
                        // Po krátké prodlevě opět přidáme listener
                        setTimeout(() => {
                            window.addEventListener('hashchange', hashChangeHandler);
                            isNavigating = false;
                        }, 50);
                    } else {
                        isNavigating = false;
                    }
                });
            } else {
                contentContainer.innerHTML = '<p class="text-red-500">Stránka nenalezena</p>';
                isNavigating = false;
            }
        };
        
        // Handler pro hashchange, vytvořen jako pojmenovaná funkce, abychom ho mohli přidat/odebrat
        const hashChangeHandler = () => {
            const path = window.location.hash.slice(1) || '/';
            navigateTo(path);
        };
        
        // Obsluha kliknutí na odkazy
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.getAttribute('data-link') !== null) {
                e.preventDefault();
                const path = target.getAttribute('href') || '/';
                navigateTo(path);
            }
        });
        
        // Obsluha změny hashe v URL
        window.addEventListener('hashchange', hashChangeHandler);
        
        // Načtení počáteční stránky
        const path = window.location.hash.slice(1) || '/';
        navigateTo(path);
    });
}