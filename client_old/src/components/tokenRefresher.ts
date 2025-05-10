import { refreshToken } from '../auth.js';

export function refreshTokenRegular() : void {
    //Tento oddíl slouží k obnovení tokenu po celou dobu, kdy je stránka používána, vlastně otevřená...
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.log("No token found - repeater setting up");
        return;
    }

    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    const timeForRefresh = (expiry - (Math.floor((new Date()).getTime() / 1000))) * 0.9;
    console.log(`timeForRefresh: ${timeForRefresh}`);
    if (timeForRefresh < 0) {
        console.log("Token expired - myApp repeater setting up");
        return;
    }

    // Kontrola, zda prohlížeč podporuje navigator.locks API
    const supportsLocks = typeof navigator.locks === 'object' && navigator.locks !== null;
    
    async function jwtTokenRepetitiveRefresher() {
        try {
            let shouldRefresh = false;
            
            if (supportsLocks) {
                // Použití navigator.locks, pokud je k dispozici
                const result = await navigator.locks.request("jwt-refresh-lock", { ifAvailable: true }, async lock => {
                    if (lock) {
                        console.log("Získán zámek pro refresh, provádím obnovu tokenu");
                        await refreshToken();
                        console.log("Token refreshed....................................................");
                        return true;
                    } else {
                        console.log("Jiná záložka již provádí refresh tokenu");
                        return false;
                    }
                });
                shouldRefresh = result;
            } else {
                // Fallback pro prohlížeče bez podpory navigator.locks
                // Kontrola, zda jsme aktivní záložka
                const activeTabId = localStorage.getItem('jwt-active-tab');
                const myTabId = localStorage.getItem('my-tab-id'); // Uložené ID této záložky
                
                if (activeTabId === myTabId) {
                    console.log("navigator.locks není podporován, provádím refresh jako aktivní záložka");
                    await refreshToken();
                    console.log("Token refreshed (bez lock API)....................................................");
                    shouldRefresh = true;
                    
                    // Aktualizace času posledního pingu
                    localStorage.setItem('jwt-last-ping', Date.now().toString());
                } else {
                    console.log("Nejsme aktivní záložka, refresh přeskočen");
                    shouldRefresh = false;
                }
            }
            
            // Naplánujeme další obnovu pouze v té záložce, která skutečně provedla refresh
            if (shouldRefresh) {
                // Získáme aktualizovaný token a vypočteme nový čas pro refresh
                const newToken = localStorage.getItem('jwt_token');
                if (newToken) {
                    const newExpiry = (JSON.parse(atob(newToken.split('.')[1]))).exp;
                    const newTimeForRefresh = (newExpiry - (Math.floor((new Date()).getTime() / 1000))) * 0.9;
                    
                    // Nastavíme nový timeout pro další obnovu
                    setTimeout(jwtTokenRepetitiveRefresher, newTimeForRefresh * 1000);
                }
            }
        }
        catch (error) { 
            console.error("refreshToken error: ", error);
        }
    }

    if (supportsLocks) {
        // Použití mechanismu pro koordinaci záložek, pokud je k dispozici navigator.locks
        navigator.locks.request("jwt-refresh-coordinator", { mode: "shared" }, async lock => {
            if (lock) {
                // Nastavíme "hlavní" záložku pomocí localStorage
                const activeTabId = localStorage.getItem('jwt-active-tab');
                const myTabId = Date.now().toString() + Math.random().toString();
                
                if (!activeTabId) {
                    // Jsme první záložka, nastavíme se jako aktivní
                    localStorage.setItem('jwt-active-tab', myTabId);
                    // Spustíme první refresh
                    setTimeout(jwtTokenRepetitiveRefresher, 100); // Malá prodleva pro jistotu
                }
                
                // Nasloucháme událostem localStorage
                window.addEventListener('storage', event => {
                    if (event.key === 'jwt-active-tab' && event.newValue === null) {
                        // Aktivní záložka byla zavřena, pokusíme se stát novou aktivní záložkou
                        localStorage.setItem('jwt-active-tab', myTabId);
                        // Spustíme refresh
                        setTimeout(jwtTokenRepetitiveRefresher, 100);
                    }
                });
                
                // Při zavření záložky smažeme naši ID, pokud jsme aktivní záložka
                window.addEventListener('beforeunload', () => {
                    if (localStorage.getItem('jwt-active-tab') === myTabId) {
                        localStorage.removeItem('jwt-active-tab');
                    }
                });
            }
        });
    } else {
        // Fallback pro prohlížeče bez podpory navigator.locks
        // Implementace vlastního mechanismu koordinace záložek pomocí localStorage
        
        const myTabId = Date.now().toString() + Math.random().toString();
        // Uložíme ID této záložky do localStorage, aby ho funkce jwtTokenRepetitiveRefresher mohla použít
        localStorage.setItem('my-tab-id', myTabId);
        const activeTabId = localStorage.getItem('jwt-active-tab');
        
        if (!activeTabId) {
            // Jsme první záložka, nastavíme se jako aktivní
            localStorage.setItem('jwt-active-tab', myTabId);
            localStorage.setItem('jwt-last-ping', Date.now().toString());
            // Spustíme první refresh
            setTimeout(jwtTokenRepetitiveRefresher, 100);
        }
        
        // Pravidelná kontrola aktivní záložky a ping
        const pingInterval = setInterval(() => {
            const currentActiveTab = localStorage.getItem('jwt-active-tab');
            const lastPingTime = parseInt(localStorage.getItem('jwt-last-ping') || '0');
            const now = Date.now();
            
            // Pokud jsme aktivní záložka, aktualizujeme čas posledního pingu
            if (currentActiveTab === myTabId) {
                localStorage.setItem('jwt-last-ping', now.toString());
            } 
            // Pokud aktivní záložka neodpovídá déle než 5 sekund, převezmeme její roli
            else if (now - lastPingTime > 5000) {
                localStorage.setItem('jwt-active-tab', myTabId);
                localStorage.setItem('jwt-last-ping', now.toString());
                // Spustíme refresh po převzetí role
                setTimeout(jwtTokenRepetitiveRefresher, 100);
            }
        }, 1000);
        
        // Nasloucháme událostem localStorage
        window.addEventListener('storage', event => {
            if (event.key === 'jwt-active-tab') {
                // Pokud se změnila aktivní záložka a není to naše ID, přestaneme dělat refresh
                if (event.newValue !== myTabId && event.oldValue === myTabId) {
                    // Jiná záložka převzala kontrolu
                }
                // Pokud aktivní záložka zmizela a my jsme nejrychlejší
                else if (event.newValue === null) {
                    // Pokusíme se stát novou aktivní záložkou
                    localStorage.setItem('jwt-active-tab', myTabId);
                    localStorage.setItem('jwt-last-ping', Date.now().toString());
                    // Spustíme refresh
                    setTimeout(jwtTokenRepetitiveRefresher, 100);
                }
            }
        });
        
        // Při zavření záložky smažeme naši ID, pokud jsme aktivní záložka
        window.addEventListener('beforeunload', () => {
            clearInterval(pingInterval);
            if (localStorage.getItem('jwt-active-tab') === myTabId) {
                localStorage.removeItem('jwt-active-tab');
            }
        });
    }
}