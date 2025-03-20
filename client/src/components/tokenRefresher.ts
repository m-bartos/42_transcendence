import { refreshToken } from '../auth.js';

export  function refreshTokenRegular() : void {
    //Tento oodil slouzi k obnoveni tokenu po celou dobu, kdy js stranka pouzinava, vlastne otevrena...
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.log("No token found - repeter setting up");
        return;
    }

    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    const timeForRefresh = (expiry - (Math.floor((new Date()).getTime() / 1000))) * 0.9;
    console.log(`timeForRefresh: ${timeForRefresh}`);
    if (timeForRefresh < 0) {
        console.log("Token expired - myApp repeter setting up");
        return;
    }

    async function jwtTokenRepetitiveRefresher() {
        try {
            // Získáme zámek pro obnovu tokenu
            const result = await navigator.locks.request("jwt-refresh-lock", { ifAvailable: true }, async lock => {
                if (lock) {
                    console.log("Získán zámek pro refresh, provádím obnovu tokenu");
                    await refreshToken();
                    console.log("Token refreshed....................................................");
                    return true; // Vrátíme true, pokud jsme provedli refresh
                } else {
                    console.log("Jiná záložka již provádí refresh tokenu");
                    return false;
                }
            });
            
            // Naplánujeme další obnovu pouze v té záložce, která skutečně provedla refresh
            if (result) {
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

    // Globální zámek pro koordinaci mezi záložkami
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
}