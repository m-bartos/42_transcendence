// reseni pro velmi kratke tokeny!!!!!!!!!!!!!!!!!!!!!!!!!!!
// import { api_refresh_token_url } from '../../../config/api_url_config';
// import { checkAuth } from '../../../api/checkAuth';
// import { cleanDataAndReload } from '../security/securityUtils';
// import { showToast } from '../loginRegistration/showToast';

// /**
//  * Funkce pro obnovu JWT tokenu na serveru
//  * @returns Promise<boolean> - true pokud byl token úspěšně obnoven, false při chybě
//  */
// export async function refreshToken(): Promise<boolean> {
//     // Zkontroluj, jestli máme platný token pro autentizaci
//     if(checkAuth()) {
//         // Připrav HTTP požadavek s aktuálním JWT tokenem v Authorization hlavičce
//         const requestOptions = {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('jwt')}`
//             }
//         };
        
//         try {
//             // Pošli požadavek na server pro obnovu tokenu
//             const response = await fetch(api_refresh_token_url, requestOptions);
//             const data = await response.json();
            
//             if (response.ok) {
//                 //  ÚSPĚCH: Server vrátil nový token
//                 localStorage.setItem('jwt', data.data.token);
//                 //console.log("Refresh token successssssssssssssssssssssssssssssssssssssss");
//                 return true;
//             }
//             else if(response.status === 401) {
//                 //UNAUTHORIZED: Token už není platný, uživatel se musí znovu přihlásit
//                 console.error("Refresh token failed - 401");
//                 showToast("Your session has expired. Please log in again. - 401", 'error');
//                 cleanDataAndReload(); // Vymaže data a přesměruje na login
//                 return false;
//             }
//             else {
//                 //  JINÁ CHYBA: Server error (400, 500, atd.)
//                 console.error("Refresh token failed - 400/500");
//                 showToast("Error refreshing token -- Else function refreshToken() - 400/500", 'error');
//                 cleanDataAndReload();
//                 return false;
//             }
//         } catch (error) {
//             //  SÍŤOVÁ CHYBA: Problém s připojením k serveru
//             console.error('Error refreshing token from nginx:', error);
//             showToast("Error refreshing token -- Catch function refreshToken() -- nginx", 'error');
//             cleanDataAndReload();
//             return false;
//         }
//     }
//     else {
//         //  ŽÁDNÝ TOKEN: Nejsou žádná autentizační data
//         console.error("Refresh token failed - no token found");
//         cleanDataAndReload();
//         return false;
//     }
// }

// /**
//  * Třída pro správu automatického obnovování JWT tokenů
//  * Zajišťuje, že pouze jedna záložka provádí refresh v daný okamžik
//  */
// class TokenRefreshManager {
//     // Timer ID pro naplánovaný refresh - null když není aktivní
//     private refreshTimer: number | null = null;
    
//     // Konstanta: Refresh token když zbývá 10% z jeho životnosti (90% už uplynulo)
//     private readonly REFRESH_BUFFER = 0.9;
    
//     // Konstanta: Bezpečnostní margin 30 sekund před vypršením (jen pro dlouhé tokeny)
//     private readonly SAFETY_MARGIN = 30;
    
//     // Konstanta: Minimální interval mezi refreshy (jen pro dlouhé tokeny)
//     private readonly MIN_REFRESH_INTERVAL = 60;
    
//     // Event listener pro sledování změn v localStorage z jiných záložek
//     private storageListener: ((e: StorageEvent) => void) | null = null;
    
//     // Hash posledního tokenu pro detekci změn
//     private lastTokenHash: string | null = null;
    
//     // Flag pro prevenci současného spuštění více refreshů
//     private isRefreshing = false;

//     constructor() {        
//         // Nastav listener pro sledování změn tokenu z jiných záložek
//         this.storageListener = (e: StorageEvent) => {
//             // Reaguj pouze na změny JWT tokenu (ne na jiné localStorage klíče)
//             if (e.key === 'jwt' && e.newValue !== e.oldValue) {
//                 //console.log('📡 Token změněn v jiné záložce, kontroluji...');
//                 this.handleTokenChange();
//             }
//         };
        
//         // Zaregistruj listener pro storage eventy
//         window.addEventListener('storage', this.storageListener);
//     }

//     /**
//      * Zpracuje změnu tokenu z jiné záložky
//      * Kontroluje, jestli se token skutečně změnil a přeplánuje refresh
//      */
//     private handleTokenChange(): void {
//         const currentToken = localStorage.getItem('jwt');
//         const currentHash = currentToken ? this.hashToken(currentToken) : null;
        
//         // Porovnej hash nového tokenu s posledním známým
//         if (currentHash !== this.lastTokenHash) {
//            //console.log('Detekována skutečná změna tokenu, přeplánuji refresh');
            
//             // Aktualizuj hash a restart timer
//             this.lastTokenHash = currentHash;
//             this.stop(); // Zruš současný timer
//             this.startPeriodicRefresh(); // Naplánuj nový refresh podle nového tokenu
//         } else {
//            //console.log('Token se nezměnil (stejný hash), ignoruji');
//         }
//     }

//     /**
//      * Vytvoří hash z JWT tokenu pro porovnání změn
//      * Používá payload část tokenu (prostřední část mezi tečkami)
//      */
//     private hashToken(token: string): string {
//         try {
//             // JWT má formát: header.payload.signature
//             // Používáme payload část jako jednoduchý hash
//             return token.split('.')[1];
//         } catch (e) {
//             console.warn('Nepodařilo se vytvořit hash tokenu');
//             return token.substring(0, 50); // fallback
//         }
//     }

//     /**
//      * Spustí periodické obnovování tokenu
//      * Vypočítá správný čas pro refresh a naplánuje ho
//      */
//     async startPeriodicRefresh(): Promise<void> {
//         //console.log('Spouštím startPeriodicRefresh()');
        
//         const token = localStorage.getItem('jwt');
//         if (!token) {
//             console.error(' Žádný token nenalezen, ukončuji');
//             cleanDataAndReload(); // Vymaže data a přesměruje na login
//             return;
//         }

//         // Aktualizuj hash aktuálního tokenu
//         this.lastTokenHash = this.hashToken(token);

//         try {
//             // Dekóduj payload část JWT tokenu (base64)
//             const payload = JSON.parse(atob(token.split('.')[1]));
//             const now = Math.floor(Date.now() / 1000); // Aktuální čas v sekundách
//             const expiry = payload.exp; // Čas vypršení tokenu
//             const issued = payload.iat || (expiry - 3600); // Čas vydání tokenu (fallback 1h)
            
//             // Vypočti čas pro refresh
//             const tokenLifetime = expiry - issued; // Celková životnost tokenu
//             console.log(`Životnost tokenu: ${tokenLifetime} sekund`);
            
//             //  PROBLÉM BYL TADY! Pro krátké tokeny (15s) musíme upravit logiku
//             let timeUntilRefresh;
            
//             if (tokenLifetime <= 60) {
//                 // Pro krátké tokeny (≤60s): refresh po 70% životnosti
//                 timeUntilRefresh = Math.max((expiry - now) - (tokenLifetime * 0.3), 1);
//                 console.log(`Krátký token: refresh za ${timeUntilRefresh}s (70% životnosti)`);
//             } else {
//                 // Pro dlouhé tokeny: původní logika s SAFETY_MARGIN
//                 const refreshTime = expiry - (tokenLifetime * (1 - this.REFRESH_BUFFER)) - this.SAFETY_MARGIN;
//                 timeUntilRefresh = Math.max(refreshTime - now, this.MIN_REFRESH_INTERVAL);
//                 console.log(`Dlouhý token: refresh za ${timeUntilRefresh}s (buffer + margin)`);
//             }
            
//             // Pokud je čas záporný nebo velmi malý, refreshni hned
//             if (timeUntilRefresh <= 0) {
//                 console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡ Token potřebuje okamžitý refresh ⚡⚡⚡⚡⚡⚡⚡⚡⚡');
//                 this.performRefresh();
//                 return;
//             }

//             // Naplánuj refresh pomocí setTimeout
//             this.refreshTimer = window.setTimeout(
//                 () => {
//                     //console.log(' Timer vypršel, spouštím refresh...');
//                     this.performRefresh();
//                 },
//                 timeUntilRefresh * 1000
//             );
            
//             //console.log(`Refresh timer nastaven (ID: ${this.refreshTimer})`);
            
//         } catch (error) {
//             console.error(' Chyba při parsování tokenu:', error);
//             // Při chybě zkus refresh za 10 sekund (ne 5 minut!)
//             //console.log('Nastavuji fallback refresh za 10 sekund');
//             this.refreshTimer = window.setTimeout(
//                 () => this.performRefresh(),
//                 10 * 1000
//             );
//         }
//     }

//     /**
//      * Provede refresh tokenu s koordinací mezi záložkami
//      * Používá navigator.locks API pro synchronizaci
//      */
//     private async performRefresh(): Promise<void> {
//         //console.log('Spouštím performRefresh()');
        
//         // Kontrola, jestli už neběží jiný refresh
//         if (this.isRefreshing) {
//             //console.log('Refresh již probíhá v této záložce, přeskakuji');
//             return;
//         }

//         // Před refreshem zkontroluj, jestli token skutečně potřebuje obnovu
//         const token = localStorage.getItem('jwt');
//         if (!token) {
//             cleanDataAndReload(); // Vymaže data a přesměruje na login
//             return;
//         }

//         try {
//             // Zkontroluj aktuální stav tokenu
//             const payload = JSON.parse(atob(token.split('.')[1]));
//             const now = Math.floor(Date.now() / 1000);
//             const expiry = payload.exp;
//             const timeLeft = expiry - now;
            
//             //  OPRAVA: Upravená kontrola pro krátké tokeny
//             const tokenLifetime = expiry - (payload.iat || (expiry - 3600));
//             let minTimeNeeded;
            
//             if (tokenLifetime <= 60) {
//                 // Pro krátké tokeny: potřebujeme aspoň 30% zbývající životnosti
//                 minTimeNeeded = tokenLifetime * 0.3;
//                 //console.log(`Krátký token - potřebuji min ${minTimeNeeded}s, mám ${timeLeft}s`);
//             } else {
//                 // Pro dlouhé tokeny: původní logika
//                 minTimeNeeded = this.SAFETY_MARGIN + 60;
//                 //console.log(`Dlouhý token - potřebuji min ${minTimeNeeded}s, mám ${timeLeft}s`);
//             }
            
//             if (timeLeft > minTimeNeeded) {
//                 //console.log('Token ještě nepotřebuje refresh, přeplánuji');
//                 this.startPeriodicRefresh();
//                 return;
//             }
            
//             //console.log(' Token potřebuje refresh, pokračuji');
//         } catch (e) {
//             console.warn('Nepodařilo se ověřit čas tokenu, pokračuji s refreshem');
//         }

//         // Kontrola dostupnosti navigator.locks API
//         if (!navigator.locks) {
//             console.warn('Navigator.locks není dostupný, používám fallback');
//             await this.doRefresh();
//             return;
//         }

//         try {
//             //console.log(' Pokus o získání zámku "jwt-refresh"');
            
//             // Pokus o získání exkluzivního zámku pro refresh
//             const lockAcquired = await navigator.locks.request(
//                 'jwt-refresh',
//                 { ifAvailable: true }, // Neblokující - vrátí false pokud je zámek obsazený
//                 async (lock) => {
//                     if (!lock) {
//                         //console.log('Zámek není dostupný (jiná záložka refreshuje)');
//                         return false;
//                     }
                    
//                     //console.log('Zámek získán, provádím refresh');
//                     await this.doRefresh();
//                     //console.log('Zámek uvolněn');
//                     return true;
//                 }
//             );

//             if (!lockAcquired) {
//                 //console.log('⏳ Jiná záložka provádí refresh, čekám na výsledek...');
                
//                 // Počkej chvíli a pak zkontroluj, jestli se token mezitím nezměnil
//                 setTimeout(() => {
//                     //console.log('Kontroluji změny tokenu po čekání');
//                     this.handleTokenChange(); // Zkontroluj změny
                    
//                     // Pokud není timer aktivní, naplánuj znovu
//                     if (!this.refreshTimer) {
//                         //console.log('⚡ Timer není aktivní, přeplánuji refresh');
//                         this.startPeriodicRefresh();
//                     }
//                 }, 3000);
//             }
//         } catch (error) {
//             console.error(' Chyba při získávání zámku:', error);
//             //console.log(' Použiji fallback bez zámku');
//             await this.doRefresh();
//         }
//     }

//     /**
//      * Skutečné provedení refresh operace
//      * Volá refreshToken() funkci a zpracovává výsledek
//      */
//     private async doRefresh(): Promise<void> {
//         // Double-check prevence současného refreshu
//         if (this.isRefreshing) {
//             //console.log('doRefresh: Již běží, přeskakuji');
//             return;
//         }
        
//         // Nastav flag pro prevenci duplicity
//         this.isRefreshing = true;
//         //console.log('Nastavuji isRefreshing = true');
//         //console.log('Spouštím skutečný refresh tokenu...');
        
//         try {
//             // Zavolej hlavní refresh funkci
//             const success = await refreshToken();
            
//             if (success) {
//                 //console.log(' Refresh úspěšný, plánuji další');
//                 // Úspěšný refresh - naplánuj další podle nového tokenu
//                 this.startPeriodicRefresh();
//             } else {
//                 //console.log(' Refresh neúspěšný, zkusím znovu za 1 minutu');
//                 // Neúspěšný refresh - zkus znovu za minutu
//                 this.refreshTimer = window.setTimeout(
//                     () => {
//                         //console.log(' Retry timer vypršel, zkouším refresh znovu');
//                         this.performRefresh();
//                     },
//                     60 * 1000
//                 );
//             }
//         } finally {
//             // Vždy resetuj flag, i při chybě
//             this.isRefreshing = false;
//             //console.log('Nastavuji isRefreshing = false');
//         }
//     }

//     /**
//      * Zastaví naplánovaný refresh timer
//      */
//     stop(): void {
//         if (this.refreshTimer) {
//             //console.log(`Ruším refresh timer (ID: ${this.refreshTimer})`);
//             clearTimeout(this.refreshTimer);
//             this.refreshTimer = null;
//         } else {
//             //console.log('Žádný timer k rušení');
//         }
//     }

//     /**
//      * Kompletní vyčištění - zastaví timer a odregistruje event listenery
//      */
//     destroy(): void {
//         //console.log('🧹 Ničím TokenRefreshManager');
        
//         // Zastaví timer
//         this.stop();
        
//         // Odregistruj storage listener
//         if (this.storageListener) {
//             window.removeEventListener('storage', this.storageListener);
//             this.storageListener = null;
//             //console.log(' Storage listener odregistrován');
//         }
//         //console.log(' TokenRefreshManager zničen');
//     }
// }

// // Singleton instance - pouze jedna instance manageru v celé aplikaci
// let tokenManager: TokenRefreshManager | null = null;

// /**
//  * Hlavní exportovaná funkce pro spuštění automatického refresh manageru
//  * Zajišťuje singleton pattern - pouze jedna instance manageru
//  */
// export function refreshTokenRegular(): void {
//     //console.log('🎬 Volána refreshTokenRegular()');
    
//     if (!tokenManager) {
//         //console.log(' Vytvářím novou instanci TokenRefreshManager');
//         tokenManager = new TokenRefreshManager();
//     } else {
//         //console.log('♻️ Používám existující instanci TokenRefreshManager');
//     }
    
//     // Spusť nebo restart periodického refreshe
//     tokenManager.startPeriodicRefresh();
//     //console.log(" Token refresh manager started.");
// }

// // Vyčištění při zavření stránky/záložky
// window.addEventListener('beforeunload', () => {
//    //console.log(' Stránka se zavírá, ničím token manager');
//     if (tokenManager) {
//         tokenManager.destroy();
//         tokenManager = null;
//     }
// });


import { api_refresh_token_url } from '../../../config/api_url_config';
import { checkAuth } from '../../../api/checkAuth'; // Tato funkce pouze kontroluje přítomnost JWT v localStorage
import { cleanDataAndReload } from '../security/securityUtils'; // Funkce pro vyčištění dat a přesměrování na login
import { showToast } from '../loginRegistration/showToast'; // Funkce pro zobrazení notifikace

// --- Globální konstanty ---
const JWT_STORAGE_KEY = 'jwt'; // Klíč pro uložení JWT v localStorage
const REFRESH_LOCK_KEY = 'jwt_refresh_lock'; // Klíč pro zamykání refreshe v localStorage (fallback)
const REFRESH_LOCK_TIMEOUT = 5000; // Doba, po kterou držíme localStorage zámek v ms
const REFRESH_EARLY_SECONDS = 60; // Refresh tokenu, když mu zbývá 60 sekund platnosti
const MAX_REFRESH_ATTEMPTS = 5; // Maximální počet pokusů o refresh při selhání

/**
 * Funkce pro obnovu JWT tokenu na serveru.
 * Tato funkce provádí samotný HTTP požadavek na refresh endpoint.
 *
 * @returns {Promise<boolean>} `true` pokud byl token úspěšně obnoven, `false` při chybě.
 */
export async function refreshToken(): Promise<boolean> {
    const currentToken = localStorage.getItem(JWT_STORAGE_KEY);

    // 1. Zkontroluj, jestli máme aktuální token pro autentizaci
    if (!checkAuth() || !currentToken) {
        console.error("RefreshToken: Selhalo - žádný token k obnově.");
        // Voláme cleanDataAndReload, protože nemáme token k obnově.
        cleanDataAndReload();
        return false;
    }

    // Připrav HTTP požadavek s aktuálním JWT tokenem v Authorization hlavičce.
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${currentToken}`
        }
    };

    try {
        // Pošli požadavek na server pro obnovu tokenu.
        const response = await fetch(api_refresh_token_url, requestOptions);
        const data = await response.json(); // Pokus o parsování odpovědi i při chybě

        if (response.ok) {
            // ÚSPĚCH: Server vrátil nový token. Ulož ho.
            localStorage.setItem(JWT_STORAGE_KEY, data.data.token);
            //console.log("RefreshToken: Úspěšně obnoven!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!.");
            return true;
        } else if (response.status === 401) {
            // UNAUTHORIZED: Token už není platný, uživatel se musí znovu přihlásit.
            console.error("RefreshToken: Selhalo - 401 Unauthorized. Relace vypršela.");
            showToast("Vaše relace vypršela. Prosím, přihlaste se znovu.", 'error');
            cleanDataAndReload(); // Vymaže data a přesměruje na login
            return false;
        } else {
            // JINÁ CHYBA: Server error (400, 500, atd.).
            console.error(`RefreshToken: Selhalo - Stav ${response.status}.`, data.message || "");
            showToast("Chyba při obnově tokenu. Prosím, přihlaste se znovu.", 'error');
            cleanDataAndReload();
            return false;
        }
    } catch (error) {
        // SÍŤOVÁ CHYBA: Problém s připojením k serveru nebo parsováním JSON.
        console.error('RefreshToken: Síťová chyba nebo chyba JSON parsování:', error);
        showToast("Chyba připojení při obnově tokenu. Prosím, přihlaste se znovu.", 'error');
        cleanDataAndReload();
        return false;
    }
}

/**
 * Třída pro správu automatického obnovování JWT tokenů v SPA.
 * Zajišťuje, že pouze jedna záložka provádí refresh v daný okamžik
 * pomocí Navigator.locks API nebo fallbacku na localStorage zamykání.
 */
class TokenRefreshManager {
    private refreshTimer: number | null = null; // ID timeru pro naplánovaný refresh
    private storageListener: ((e: StorageEvent) => void) | null = null; // Listener pro storage události
    private lastTokenHash: string | null = null; // Hash posledního tokenu pro detekci změn
    private isRefreshing = false; // Flag pro prevenci vícenásobného refreshu v rámci jedné záložky
    private failedAttempts = 0; // Počítadlo neúspěšných pokusů pro exponenciální backoff

    constructor() {
        // Nastav listener pro sledování změn tokenu z jiných záložek.
        this.storageListener = (e: StorageEvent) => {
            // Reaguj pouze na změny našeho JWT tokenu.
            if (e.key === JWT_STORAGE_KEY && e.newValue !== e.oldValue) {
                // Pokud jiná záložka změnila token, musíme to zohlednit a přeplánovat.
                this.handleTokenChange();
            }
        };
        // Zaregistruj listener pro storage eventy.
        window.addEventListener('storage', this.storageListener);
    }

    /**
     * Zpracuje změnu tokenu z jiné záložky (detekováno pomocí storage eventu).
     * Kontroluje, jestli se token skutečně změnil a přeplánuje refresh.
     */
    private handleTokenChange(): void {
        const currentToken = localStorage.getItem(JWT_STORAGE_KEY);
        const currentHash = currentToken ? this.hashToken(currentToken) : null;

        // Porovnej hash nového tokenu s posledním známým.
        if (currentHash !== this.lastTokenHash) {
            // console.log('TokenRefreshManager: Detekována skutečná změna tokenu z jiné záložky. Přeplánuji refresh.');
            this.lastTokenHash = currentHash; // Aktualizuj hash
            this.stop(); // Zruš současný naplánovaný refresh.
            this.startPeriodicRefresh(); // Naplánuj nový refresh podle nového tokenu.
        }
    }

    /**
     * Vytvoří hash z JWT tokenu pro porovnání změn.
     * Používá payload část tokenu (prostřední část mezi tečkami) pro zjednodušení.
     *
     * @param {string} token - JWT token.
     * @returns {string} Hash payloadu tokenu.
     */
    private hashToken(token: string): string {
        try {
            // JWT má formát: header.payload.signature. Používáme payload část.
            return token.split('.')[1];
        } catch (e) {
            // Pokud nelze rozdělit, vrátíme část tokenu jako fallback.
            console.warn('TokenRefreshManager: Nepodařilo se vytvořit hash tokenu. Používám fallback.', e);
            return token.substring(0, 50); // Může být neúplný, ale stále indikuje změnu.
        }
    }

    /**
     * Spustí periodické obnovování tokenu.
     * Vypočítá správný čas pro refresh a naplánuje ho pomocí setTimeout.
     */
    public async startPeriodicRefresh(): Promise<void> {
        // Zastav předchozí timer, pokud existuje, aby nedocházelo k duplicitě.
        this.stop();

        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (!token) {
            console.error('TokenRefreshManager: Žádný token nenalezen, nelze naplánovat refresh. Odhlašuji.');
            cleanDataAndReload();
            return;
        }

        // Aktualizuj hash aktuálního tokenu pro sledování změn.
        this.lastTokenHash = this.hashToken(token);

        try {
            // Dekóduj payload část JWT tokenu (base64).
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000); // Aktuální čas v sekundách
            const expiry = payload.exp; // Čas vypršení tokenu

            // KRITICKÁ KONTROLA: Ověř přítomnost 'iat' claimu.
            // Bez něj je token považován za nevalidní pro plánování.
            if (typeof payload.iat !== 'number') {
                console.error('TokenRefreshManager: JWT payload neobsahuje "iat" claim. Token je neplatný. Odhlašuji.');
                showToast("Chyba tokenu: Chybí čas vydání. Přihlaste se prosím znovu.", 'error');
                cleanDataAndReload();
                return;
            }
            const issued = payload.iat; // Čas vydání tokenu

            // Vypočti dobu zbývající do vypršení tokenu.
            const timeLeft = expiry - now;

            // Vypočti, za jak dlouho se má token obnovit.
            // Chceme obnovit REFRESH_EARLY_SECONDS před vypršením.
            let timeUntilRefresh = timeLeft - REFRESH_EARLY_SECONDS;
            //console.log(`TokenRefreshManager: Čas do vypršení tokenu: ${timeLeft}s, plánovaný refresh za ${timeUntilRefresh}s.`);

            // Zajisti, aby čas na refresh nebyl záporný nebo příliš malý (min. 1 sekunda).
            // Může se stát, že token je již téměř vypršelý.
            timeUntilRefresh = Math.max(timeUntilRefresh, 1);

            if (timeLeft <= REFRESH_EARLY_SECONDS + 5) { // Pokud tokenu zbývá jen málo času (např. 65 sekund)
                console.warn(`TokenRefreshManager: Tokenu zbývá ${timeLeft}s. Pokusím se o okamžitý refresh.`);
                this.performRefresh(); // Okamžitě se pokus o refresh.
                return;
            }

            // Naplánuj refresh pomocí setTimeout. Převedeme sekundy na milisekundy.
            this.refreshTimer = window.setTimeout(
                () => {
                    //console.log(`TokenRefreshManager: Timer vypršel (${timeUntilRefresh}s), spouštím refresh.`);
                    this.performRefresh();
                },
                timeUntilRefresh * 1000
            );

            //console.log(`TokenRefreshManager: Další refresh tokenu naplánován za ${timeUntilRefresh} sekund.`);

        } catch (error) {
            console.error('TokenRefreshManager: Chyba při parsování JWT tokenu nebo výpočtu času:', error);
            showToast("Chyba při zpracování tokenu. Přihlaste se prosím znovu.", 'error');
            cleanDataAndReload();
        }
    }

    /**
     * Provede refresh tokenu s koordinací mezi záložkami.
     * Používá Navigator.locks API pro synchronizaci. Pokud není dostupné,
     * použije fallback na localStorage zamykání.
     */
    private async performRefresh(): Promise<void> {
        // Kontrola, jestli už neběží jiný refresh v této záložce.
        if (this.isRefreshing) {
            // console.log('TokenRefreshManager: Refresh již probíhá v této záložce, přeskakuji.');
            return;
        }

        // Před refreshem zkontroluj, jestli token skutečně potřebuje obnovu.
        // Tuto kontrolu provádíme znovu pro případ, že mezitím došlo ke změně stavu.
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (!token) {
            console.error('TokenRefreshManager: Žádný token k refreshování při performRefresh. Odhlašuji.');
            cleanDataAndReload();
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            const expiry = payload.exp;
            const timeLeft = expiry - now;

            // Pokud tokenu zbývá dost času, přeskoč refresh a přeplánuj.
            if (timeLeft > REFRESH_EARLY_SECONDS + 5) { // Dáme malou rezervu
                // console.log('TokenRefreshManager: Token ještě nepotřebuje refresh. Přeplánuji.');
                this.startPeriodicRefresh();
                return;
            }
        } catch (e) {
            console.warn('TokenRefreshManager: Nepodařilo se ověřit čas tokenu před refreshem. Pokračuji s pokusem o refresh.');
            // V tomto případě se raději pokusíme o refresh, abychom token nepropásli.
        }

        // --- Primární metoda zamykání: Navigator.locks API ---
        // --- Primární metoda zamykání: Navigator.locks API ---
        if (navigator.locks) {
            try {
                // Pokus o získání exkluzivního zámku pro refresh.
                // Pouze 'ifAvailable: true' - neblokuje a vrátí null, pokud je zámek obsazen.
                const lockAcquired = await navigator.locks.request(
                    'jwt-refresh-lock', // Název zámku (musí být stejný napříč záložkami)
                    { ifAvailable: true }, // Necekat, pokud je zámek obsazený.
                    async (lock) => {
                        if (!lock) {
                            // Zámek není dostupný, jiná záložka refreshuje.
                            //console.log('TokenRefreshManager: Zámek "jwt-refresh-lock" není dostupný. Jiná záložka refreshuje.');
                            return false; // Indikujeme, že zámek nebyl získán.
                        }
                        // Zámek získán. Provedeme refresh.
                        //console.log('TokenRefreshManager: Zámek "jwt-refresh-lock" získán. Provádím refresh.');
                        await this.doRefresh();
                        //console.log('TokenRefreshManager: Zámek "jwt-refresh-lock" uvolněn.');
                        return true; // Indikujeme, že zámek byl získán a refresh proveden.
                    }
                );

                if (lockAcquired === false) {
                    // Pokud zámek nebyl získán (jiná záložka ho drží).
                    //console.log('TokenRefreshManager: Čekám na dokončení refreshe jinou záložkou.');
                    // Počkej krátkou dobu a pak zkontroluj, jestli se token mezitím nezměnil.
                    setTimeout(() => this.handleTokenChange(), 3000); // Zkus znovu za 3 sekundy.
                    return; // Ukončíme, protože jiná záložka to řeší.
                } else if (lockAcquired === true) {
                    // Pokud byl zámek získán a refresh proběhl.
                    // doRefresh() už se postaralo o plánování dalšího refreshe.
                    return;
                }
                // Pokud sem kód dorazí, znamená to, že navigator.locks selhal z jiného důvodu
                // (např. chyba, která nebyla odchycena dříve).
                console.warn('TokenRefreshManager: Navigator.locks selhal z neočekávaného důvodu nebo není podporován. Přecházím na localStorage fallback.');

            } catch (error) {
                console.error('TokenRefreshManager: Chyba při práci s Navigator.locks API (vyjma ifAvailable/signal konfliktu):', error);
                console.warn('TokenRefreshManager: Přecházím na localStorage zamykání.');
            }
        } else {
            console.warn('TokenRefreshManager: Navigator.locks API není dostupné. Používám localStorage zamykání.');
        }

        // --- Fallback metoda zamykání: localStorage ---
        const now = Date.now();
        const lock = localStorage.getItem(REFRESH_LOCK_KEY);

        if (lock) {
            const lockTime = parseInt(lock, 10);
            // Pokud je zámek aktivní (nebyla překročena doba timeoutu).
            if (now - lockTime < REFRESH_LOCK_TIMEOUT) {
                //console.log('TokenRefreshManager: localStorage zámek je aktivní. Jiná záložka refreshuje.');
                setTimeout(() => this.handleTokenChange(), 3000); // Počkej a zkontroluj token.
                return; // Ukončíme, jiná záložka to řeší.
            }
        }

        // Pokud se dostaneme sem, nikdo jiný neprovádí refresh nebo zámek vypršel.
        // Nastavíme svůj zámek v localStorage.
        localStorage.setItem(REFRESH_LOCK_KEY, now.toString());
        //console.log('TokenRefreshManager: Získal jsem localStorage zámek. Provádím refresh.');

        try {
            await this.doRefresh();
        } finally {
            // Bez ohledu na výsledek, uvolníme localStorage zámek.
            localStorage.removeItem(REFRESH_LOCK_KEY);
            //console.log('TokenRefreshManager: Uvolnil jsem localStorage zámek.');
        }
    }

    /**
     * Skutečné provedení refresh operace.
     * Volá funkci `refreshToken()` a zpracovává výsledek, včetně exponenciálního backoffu.
     */
    private async doRefresh(): Promise<void> {
        // Double-check flagu pro prevenci souběžného refreshu v této záložce.
        if (this.isRefreshing) {
            //console.log('TokenRefreshManager: doRefresh již běží, přeskakuji.');
            return;
        }

        this.isRefreshing = true; // Nastav flag, že refresh probíhá.
        //console.log('TokenRefreshManager: Nastavuji isRefreshing = true, spouštím skutečný refresh.');

        try {
            const success = await refreshToken(); // Zavolej hlavní refresh funkci.

            if (success) {
                //console.log('TokenRefreshManager: Refresh tokenu úspěšný.');
                this.failedAttempts = 0; // Resetuj čítač neúspěšných pokusů.
                this.startPeriodicRefresh(); // Naplánuj další refresh podle nového tokenu.
            } else {
                // Refresh neúspěšný.
                this.failedAttempts++;
                console.warn(`TokenRefreshManager: Refresh tokenu neúspěšný. Pokus: ${this.failedAttempts}/${MAX_REFRESH_ATTEMPTS}.`);

                if (this.failedAttempts >= MAX_REFRESH_ATTEMPTS) {
                    console.error('TokenRefreshManager: Dosažen maximální počet neúspěšných pokusů o refresh. Odhlašuji.');
                    showToast("Příliš mnoho neúspěšných pokusů o obnovu relace. Přihlaste se prosím znovu.", 'error');
                    cleanDataAndReload();
                    return;
                }

                // Exponenciální backoff: Zkus znovu s prodlouženým intervalem.
                // Interval roste s počtem neúspěšných pokusů (např. 2s, 4s, 8s, 16s, 32s).
                const retryInterval = Math.pow(2, this.failedAttempts) * 1000;
                //console.log(`TokenRefreshManager: Zkusím refresh znovu za ${retryInterval / 1000} sekund.`);

                this.refreshTimer = window.setTimeout(
                    () => this.performRefresh(), // Zkus znovu vyvolat refresh.
                    retryInterval
                );
            }
        } finally {
            this.isRefreshing = false; // Vždy resetuj flag, i při chybě.
            // console.log('TokenRefreshManager: Nastavuji isRefreshing = false.');
        }
    }

    /**
     * Zastaví naplánovaný refresh timer.
     */
    public stop(): void {
        if (this.refreshTimer) {
            // console.log(`TokenRefreshManager: Ruším refresh timer (ID: ${this.refreshTimer}).`);
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Kompletní vyčištění - zastaví timer a odregistruje event listenery.
     */
    public destroy(): void {
        this.stop(); // Zastav timer.

        // Odregistruj storage listener.
        if (this.storageListener) {
            window.removeEventListener('storage', this.storageListener);
            this.storageListener = null;
            // console.log('TokenRefreshManager: Storage listener odregistrován.');
        }
        // console.log('TokenRefreshManager: Instance zničena.');
    }
}

// Singleton instance - zajistí, že v celé aplikaci existuje pouze jedna instance manažeru.
let tokenManager: TokenRefreshManager | null = null;

/**
 * Hlavní exportovaná funkce pro spuštění automatického refresh manažeru.
 * Zajišťuje singleton pattern.
 */
export function refreshTokenRegular(): void {
    // Pokud instance manažeru neexistuje, vytvoř ji.
    if (!tokenManager) {
        tokenManager = new TokenRefreshManager();
        // console.log('TokenRefreshManager: Vytvořena nová instance.');
    } else {
        // console.log('TokenRefreshManager: Používám existující instanci.');
    }

    // Spusť nebo restartuj periodický refresh.
    tokenManager.startPeriodicRefresh();
    //console.log("TokenRefreshManager: Spuštěno monitorování a obnova tokenu.");
}

// Zajištění vyčištění zdrojů při zavření stránky/záložky.
// To je důležité pro zabránění memory leaků a správné chování při opuštění stránky.
window.addEventListener('beforeunload', () => {
    //console.log('TokenRefreshManager: Stránka se zavírá, ničím instanci manažeru.');
    if (tokenManager) {
        tokenManager.destroy();
        tokenManager = null;
    }
});