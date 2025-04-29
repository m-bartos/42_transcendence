import { checkAuth } from './auth.js';

type RouteParams = Record<string, string>;

interface Route {
    path: string;
    component: (params?: RouteParams) => Promise<{ default: (params?: RouteParams) => Promise<HTMLElement> | HTMLElement }>;
}

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
    },
    {
        path: '/friends/:id',
        component: (params) => import('./components/friendDetail.js').then(m => ({ 
            default: async (params) => await m.showDetailsFunction(Number(params?.id)) 
        }))
    }
];

// Proměnná pro sledování, jestli zrovna probíhá navigace
let isNavigating = false;

// Funkce pro porovnání URL pattern s aktuální cestou a extrakci parametrů
function matchRoute(pattern: string, path: string): RouteParams | null {
    // Převedení pattern na regex
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) {
        return null;
    }
    
    const params: RouteParams = {};
    
    for (let i = 0; i < patternParts.length; i++) {
        // Kontrola, jestli je část pattern dynamická
        if (patternParts[i].startsWith(':')) {
            // Extrakce názvu parametru
            const paramName = patternParts[i].slice(1);
            params[paramName] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            // Pokud statická část neodpovídá, pak cesta neodpovídá pattern
            return null;
        }
    }
    
    return params;
}

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
        const navigateTo = (url: string, pushState = true) => {
            if (isNavigating) return; // Zabraňuje dvojitému načtení
            isNavigating = true;
            
            if (!checkAuth()) {
                window.history.pushState({}, '', '/');
                isNavigating = false;
                return;
            }
            
            // Odstranění base URL pro porovnání s routes
            const path = url.replace(window.location.origin, '');
            
            // Hledání odpovídající routy
            let matchedRoute: Route | undefined;
            let params: RouteParams = {};
            
            for (const route of routes) {
                const matchParams = matchRoute(route.path, path);
                if (matchParams !== null) {
                    matchedRoute = route;
                    params = matchParams;
                    break;
                }
            }
            
            if (matchedRoute) {
                matchedRoute.component(params).then(async module => {
                    contentContainer.innerHTML = '';
                    
                    // Zpracování jak synchronních, tak asynchronních komponent
                    const result = module.default(params);
                    const element = result instanceof Promise ? await result : result;
                    
                    contentContainer.appendChild(element);
                    
                    // Přidání historie pomocí History API, ale pouze pokud je pushState true
                    if (pushState) {
                        window.history.pushState({ path: url }, '', url);
                    }
                    
                    console.log('Navigating to:', url);
                    isNavigating = false;
                });
            } else {
                contentContainer.innerHTML = '<p class="text-red-500">Stránka nenalezena</p>';
                if (pushState) {
                    window.history.pushState({ path: url }, '', url);
                }
                isNavigating = false;
            }
        };
        
        // Obsluha kliknutí na odkazy
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.getAttribute('data-link') !== null) {
                e.preventDefault();
                const url = target.getAttribute('href') || '/';
                navigateTo(url);
            }
        });
        
        // Obsluha History API událostí (tlačítka zpět/vpřed v prohlížeči)
        window.addEventListener('popstate', () => {
            navigateTo(window.location.pathname, false);
        });
        
        // Načtení počáteční stránky
        navigateTo(window.location.pathname);
    });
}

// Funkce pro získání aktuální cesty
export function getCurrentPath(): string {
    return window.location.pathname;
}

// Exportujeme funkci pro navigaci, abychom ji mohli použít i jinde
export function navigate(path: string): void {
    if (isNavigating) return;
    
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    window.history.pushState({}, '', fullPath);
    
    // Manuálně aktivujeme navigaci, protože pushState nevyvolá popstate
    const event = new PopStateEvent('popstate');
    window.dispatchEvent(event);
}