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
                    
        // const token = localStorage.getItem('jwt_token');
        // if (!token) {
        //     console.log("No token found - repeter setting up");
        //     return false;
        // }

        // const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        // const timeForRefresh = (expiry - (Math.floor((new Date()).getTime() / 1000))) * 0.9;
        // console.log(`timeForRefresh: ${timeForRefresh}`);
        // if (timeForRefresh < 0) {
        //     console.log("Token expired - Page1 repeter setting up");
        //     return false;
        // }
                    
        // async function jwtTokenRepetitiveRefresher() {
        //     try {
        //         await refreshToken();
        //         console.log("Token refreshed....................................................");
        //     }
        //     catch (error) { 
        //         console.log("refreshToken error: ", error);
        //     }
        //   }
          
        //   // Spouštíme opakovane volání funkce pro obnovu tokenu)
        // setInterval(() => {
        //     navigator.locks.request("my-periodic-task", async () => {
        //         jwtTokenRepetitiveRefresher();
        //     }).catch((err) => {
        //       // Případné zpracování chyby, pokud by se lock nezískal
        //       console.error("Nepodařilo se získat zámek:", err);
        //     });
        // }, timeForRefresh * 1000);

        // const token = localStorage.getItem('jwt_token');
        // if (!token) {
        //     console.log("No token found - repeter setting up");
        //     return false;
        // }

        // const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        // const timeForRefresh = (expiry - (Math.floor((new Date()).getTime() / 1000))) * 0.9;
        // console.log(`timeForRefresh: ${timeForRefresh}`);
        // if (timeForRefresh < 0) {
        //     console.log("Token expired - Page1 repeter setting up");
        //     return false;
        // }

        // async function jwtTokenRepetitiveRefresher() {
        //     try {
        //         await refreshToken();
        //         console.log("Token refreshed....................................................");
        //     }
        //     catch (error) { 
        //         console.log("refreshToken error: ", error);
        //     }
        // }

        // // Spouštíme opakovane volání funkce pro obnovu tokenu
        // navigator.locks.request("my-periodic-task", async lock => {
        //     if (lock) {
        //         setInterval(() => {
        //             navigator.locks.request("my-periodic-task", async () => {
        //                 jwtTokenRepetitiveRefresher();
        //             }).catch((err) => {
        //                 console.error("Nepodařilo se získat zámek:", err);
        //             });
        //         }, timeForRefresh * 1000);
        //     }
        // }).catch((err) => {
        //     console.error("Nepodařilo se získat zámek:", err);
        // });

        refreshTokenRegular();
        
        initRouter(appContainer);
    }
});