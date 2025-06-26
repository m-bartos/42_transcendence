import { api_refresh_token_url } from '../../../config/api_url_config';
import { checkAuth } from '../../../api/checkAuth';
import { cleanDataAndReload } from '../security/securityUtils';
import { showToast } from '../loginRegistration/showToast';

/**
 * Funkce pro obnovu JWT tokenu na serveru
 * @returns Promise<boolean> - true pokud byl token úspěšně obnoven, false při chybě
 */
export async function refreshToken(): Promise<boolean> {
    // Zkontroluj, jestli máme platný token pro autentizaci
    if(checkAuth()) {
        // Připrav HTTP požadavek s aktuálním JWT tokenem v Authorization hlavičce
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        };
        
        try {
            // Pošli požadavek na server pro obnovu tokenu
            const response = await fetch(api_refresh_token_url, requestOptions);
            const data = await response.json();
            
            if (response.ok) {
                //  ÚSPĚCH: Server vrátil nový token
                localStorage.setItem('jwt', data.data.token);
                //console.log("Refresh token successssssssssssssssssssssssssssssssssssssss");
                return true;
            }
            else if(response.status === 401) {
                showToast("Your session has expired. Please log in again. - 401", 'error');
                cleanDataAndReload(); // Vymaže data a přesměruje na login
                return false;
            }
            else {
                showToast("Error refreshing token -- Else function refreshToken() - 400/500", 'error');
                cleanDataAndReload();
                return false;
            }
        } catch (error) {
            showToast("Error refreshing token -- Catch function refreshToken() -- nginx", 'error');
            cleanDataAndReload();
            return false;
        }
    }
    else {
        cleanDataAndReload();
        return false;
    }
}

/**
 * Třída pro správu automatického obnovování JWT tokenů
 * Zajišťuje, že pouze jedna záložka provádí refresh v daný okamžik
 */
class TokenRefreshManager {
    // Timer ID pro naplánovaný refresh - null když není aktivní
    private refreshTimer: number | null = null;
    
    // Konstanta: Refresh token když zbývá 10% z jeho životnosti (90% už uplynulo)
    private readonly REFRESH_BUFFER = 0.9;
    
    // Konstanta: Bezpečnostní margin 30 sekund před vypršením (jen pro dlouhé tokeny)
    private readonly SAFETY_MARGIN = 30;
    
    // Konstanta: Minimální interval mezi refreshy (jen pro dlouhé tokeny)
    private readonly MIN_REFRESH_INTERVAL = 60;
    
    // Event listener pro sledování změn v localStorage z jiných záložek
    private storageListener: ((e: StorageEvent) => void) | null = null;
    
    // Hash posledního tokenu pro detekci změn
    private lastTokenHash: string | null = null;
    
    // Flag pro prevenci současného spuštění více refreshů
    private isRefreshing = false;

    constructor() {        
        // Nastav listener pro sledování změn tokenu z jiných záložek
        this.storageListener = (e: StorageEvent) => {
            // Reaguj pouze na změny JWT tokenu (ne na jiné localStorage klíče)
            if (e.key === 'jwt' && e.newValue !== e.oldValue) {
                //console.log('📡 Token změněn v jiné záložce, kontroluji...');
                this.handleTokenChange();
            }
        };
        
        // Zaregistruj listener pro storage eventy
        window.addEventListener('storage', this.storageListener);
    }

    /**
     * Zpracuje změnu tokenu z jiné záložky
     * Kontroluje, jestli se token skutečně změnil a přeplánuje refresh
     */
    private handleTokenChange(): void {
        const currentToken = localStorage.getItem('jwt');
        const currentHash = currentToken ? this.hashToken(currentToken) : null;
        
        // Porovnej hash nového tokenu s posledním známým
        if (currentHash !== this.lastTokenHash) {
           //console.log('Detekována skutečná změna tokenu, přeplánuji refresh');
            
            // Aktualizuj hash a restart timer
            this.lastTokenHash = currentHash;
            this.stop(); // Zruš současný timer
            this.startPeriodicRefresh(); // Naplánuj nový refresh podle nového tokenu
        } else {
           //console.log('Token se nezměnil (stejný hash), ignoruji');
        }
    }

    /**
     * Vytvoří hash z JWT tokenu pro porovnání změn
     * Používá payload část tokenu (prostřední část mezi tečkami)
     */
    private hashToken(token: string): string {
        try {
            // JWT má formát: header.payload.signature
            // Používáme payload část jako jednoduchý hash
            return token.split('.')[1];
        } catch (e) {
            return token.substring(0, 50); // fallback
        }
    }

    /**
     * Spustí periodické obnovování tokenu
     * Vypočítá správný čas pro refresh a naplánuje ho
     */
    async startPeriodicRefresh(): Promise<void> {
        //console.log('Spouštím startPeriodicRefresh()');
        
        const token = localStorage.getItem('jwt');
        if (!token) {
            cleanDataAndReload(); // Vymaže data a přesměruje na login
            return;
        }

        // Aktualizuj hash aktuálního tokenu
        this.lastTokenHash = this.hashToken(token);

        try {
            // Dekóduj payload část JWT tokenu (base64)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000); // Aktuální čas v sekundách
            const expiry = payload.exp; // Čas vypršení tokenu
            const issued = payload.iat || (expiry - 3600); // Čas vydání tokenu (fallback 1h)
            
            // Vypočti čas pro refresh
            const tokenLifetime = expiry - issued; // Celková životnost tokenu
            //console.log(`Životnost tokenu: ${tokenLifetime} sekund`);
            
            //  PROBLÉM BYL TADY! Pro krátké tokeny (15s) musíme upravit logiku
            let timeUntilRefresh;
            
            if (tokenLifetime <= 60) {
                // Pro krátké tokeny (≤60s): refresh po 70% životnosti
                timeUntilRefresh = Math.max((expiry - now) - (tokenLifetime * 0.3), 1);
                //console.log(`Krátký token: refresh za ${timeUntilRefresh}s (70% životnosti)`);
            } else {
                // Pro dlouhé tokeny: původní logika s SAFETY_MARGIN
                const refreshTime = expiry - (tokenLifetime * (1 - this.REFRESH_BUFFER)) - this.SAFETY_MARGIN;
                timeUntilRefresh = Math.max(refreshTime - now, this.MIN_REFRESH_INTERVAL);
                //console.log(`Dlouhý token: refresh za ${timeUntilRefresh}s (buffer + margin)`);
            }
            
            // Pokud je čas záporný nebo velmi malý, refreshni hned
            if (timeUntilRefresh <= 0) {
                //console.log('⚡ Token potřebuje okamžitý refresh');
                this.performRefresh();
                return;
            }

            // Naplánuj refresh pomocí setTimeout
            this.refreshTimer = window.setTimeout(
                () => {
                    //console.log(' Timer vypršel, spouštím refresh...');
                    this.performRefresh();
                },
                timeUntilRefresh * 1000
            );
            
            //console.log(`Refresh timer nastaven (ID: ${this.refreshTimer})`);
            
        } catch (error) {
            console.error(' Chyba při parsování tokenu:', error);
            // Při chybě zkus refresh za 10 sekund (ne 5 minut!)
            //console.log('Nastavuji fallback refresh za 10 sekund');
            this.refreshTimer = window.setTimeout(
                () => this.performRefresh(),
                10 * 1000
            );
        }
    }

    /**
     * Provede refresh tokenu s koordinací mezi záložkami
     * Používá navigator.locks API pro synchronizaci
     */
    private async performRefresh(): Promise<void> {
        //console.log('Spouštím performRefresh()');
        
        // Kontrola, jestli už neběží jiný refresh
        if (this.isRefreshing) {
            //console.log('Refresh již probíhá v této záložce, přeskakuji');
            return;
        }

        // Před refreshem zkontroluj, jestli token skutečně potřebuje obnovu
        const token = localStorage.getItem('jwt');
        if (!token) {
            cleanDataAndReload(); // Vymaže data a přesměruje na login
            return;
        }

        try {
            // Zkontroluj aktuální stav tokenu
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            const expiry = payload.exp;
            const timeLeft = expiry - now;
            
            //  OPRAVA: Upravená kontrola pro krátké tokeny
            const tokenLifetime = expiry - (payload.iat || (expiry - 3600));
            let minTimeNeeded;
            
            if (tokenLifetime <= 60) {
                // Pro krátké tokeny: potřebujeme aspoň 30% zbývající životnosti
                minTimeNeeded = tokenLifetime * 0.3;
                //console.log(`Krátký token - potřebuji min ${minTimeNeeded}s, mám ${timeLeft}s`);
            } else {
                // Pro dlouhé tokeny: původní logika
                minTimeNeeded = this.SAFETY_MARGIN + 60;
                //console.log(`Dlouhý token - potřebuji min ${minTimeNeeded}s, mám ${timeLeft}s`);
            }
            
            if (timeLeft > minTimeNeeded) {
                //console.log('Token ještě nepotřebuje refresh, přeplánuji');
                this.startPeriodicRefresh();
                return;
            }
            
            //console.log(' Token potřebuje refresh, pokračuji');
        } catch (e) {
            console.warn('Nepodařilo se ověřit čas tokenu, pokračuji s refreshem');
        }

        // Kontrola dostupnosti navigator.locks API
        if (!navigator.locks) {
            console.warn('Navigator.locks není dostupný, používám fallback');
            await this.doRefresh();
            return;
        }

        try {
            //console.log(' Pokus o získání zámku "jwt-refresh"');
            
            // Pokus o získání exkluzivního zámku pro refresh
            const lockAcquired = await navigator.locks.request(
                'jwt-refresh',
                { ifAvailable: true }, // Neblokující - vrátí false pokud je zámek obsazený
                async (lock) => {
                    if (!lock) {
                        //console.log('Zámek není dostupný (jiná záložka refreshuje)');
                        return false;
                    }
                    
                    //console.log('Zámek získán, provádím refresh');
                    await this.doRefresh();
                    //console.log('Zámek uvolněn');
                    return true;
                }
            );

            if (!lockAcquired) {
                //console.log('⏳ Jiná záložka provádí refresh, čekám na výsledek...');
                
                // Počkej chvíli a pak zkontroluj, jestli se token mezitím nezměnil
                setTimeout(() => {
                    //console.log('Kontroluji změny tokenu po čekání');
                    this.handleTokenChange(); // Zkontroluj změny
                    
                    // Pokud není timer aktivní, naplánuj znovu
                    if (!this.refreshTimer) {
                        //console.log('⚡ Timer není aktivní, přeplánuji refresh');
                        this.startPeriodicRefresh();
                    }
                }, 3000);
            }
        } catch (error) {
            console.error(' Chyba při získávání zámku:', error);
            //console.log(' Použiji fallback bez zámku');
            await this.doRefresh();
        }
    }

    /**
     * Skutečné provedení refresh operace
     * Volá refreshToken() funkci a zpracovává výsledek
     */
    private async doRefresh(): Promise<void> {
        // Double-check prevence současného refreshu
        if (this.isRefreshing) {
            //console.log('doRefresh: Již běží, přeskakuji');
            return;
        }
        
        // Nastav flag pro prevenci duplicity
        this.isRefreshing = true;
        //console.log('Nastavuji isRefreshing = true');
        //console.log('Spouštím skutečný refresh tokenu...');
        
        try {
            // Zavolej hlavní refresh funkci
            const success = await refreshToken();
            
            if (success) {
                //console.log(' Refresh úspěšný, plánuji další');
                // Úspěšný refresh - naplánuj další podle nového tokenu
                this.startPeriodicRefresh();
            } else {
                //console.log(' Refresh neúspěšný, zkusím znovu za 1 minutu');
                // Neúspěšný refresh - zkus znovu za minutu
                this.refreshTimer = window.setTimeout(
                    () => {
                        //console.log(' Retry timer vypršel, zkouším refresh znovu');
                        this.performRefresh();
                    },
                    60 * 1000
                );
            }
        } finally {
            // Vždy resetuj flag, i při chybě
            this.isRefreshing = false;
            //console.log('Nastavuji isRefreshing = false');
        }
    }

    /**
     * Zastaví naplánovaný refresh timer
     */
    stop(): void {
        if (this.refreshTimer) {
            //console.log(`Ruším refresh timer (ID: ${this.refreshTimer})`);
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        } else {
            //console.log('Žádný timer k rušení');
        }
    }

    /**
     * Kompletní vyčištění - zastaví timer a odregistruje event listenery
     */
    destroy(): void {
        //console.log('🧹 Ničím TokenRefreshManager');
        
        // Zastaví timer
        this.stop();
        
        // Odregistruj storage listener
        if (this.storageListener) {
            window.removeEventListener('storage', this.storageListener);
            this.storageListener = null;
            //console.log(' Storage listener odregistrován');
        }
        //console.log(' TokenRefreshManager zničen');
    }
}

// Singleton instance - pouze jedna instance manageru v celé aplikaci
let tokenManager: TokenRefreshManager | null = null;

/**
 * Hlavní exportovaná funkce pro spuštění automatického refresh manageru
 * Zajišťuje singleton pattern - pouze jedna instance manageru
 */
export function refreshTokenRegular(): void {
    //console.log('🎬 Volána refreshTokenRegular()');
    
    if (!tokenManager) {
        //console.log(' Vytvářím novou instanci TokenRefreshManager');
        tokenManager = new TokenRefreshManager();
    } else {
        //console.log('♻️ Používám existující instanci TokenRefreshManager');
    }
    
    // Spusť nebo restart periodického refreshe
    tokenManager.startPeriodicRefresh();
    //console.log(" Token refresh manager started.");
}

// Vyčištění při zavření stránky/záložky
window.addEventListener('beforeunload', () => {
   //console.log(' Stránka se zavírá, ničím token manager');
    if (tokenManager) {
        tokenManager.destroy();
        tokenManager = null;
    }
});