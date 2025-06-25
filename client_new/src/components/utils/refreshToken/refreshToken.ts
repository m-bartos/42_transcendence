import { api_refresh_token_url } from '../../../config/api_url_config';
import { checkAuth } from '../../../api/checkAuth';
import { cleanDataAndReload } from '../security/securityUtils';
import { showToast } from '../loginRegistration/showToast';


export async function refreshToken() : Promise<boolean> {
    if(checkAuth()) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        };
        try {
            const response = await fetch(api_refresh_token_url, requestOptions);
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('jwt', data.data.token);
                console.log("Refresh token successssssssssssssssssssssssssssssssssssssssssssssssss");
                return true;
            }
            else if(response.status === 401) {
                console.error("Refresh token failed - 401");
                showToast("Your session has expired. Please log in again. - 401", 'error');
                cleanDataAndReload();
                return false;
            }
            else {
                console.error("Refresh token failed - 400/500");
                showToast("Error refreshing token -- Else function refreshToken() - 400/500", 'error');
                cleanDataAndReload();
                return false;
            }
        } catch (error) {
            console.error('Error refreshing token from nginx:', error);
            showToast("Error refreshing token -- Catch function refreshToken() -- nginx", 'error');
            cleanDataAndReload();
            return false;
        }
    }
    else {
        console.error("Refresh token failed - no token found");
        cleanDataAndReload();
        return false;
    }
}

class TokenRefreshManager {
  private refreshTimer: number | null = null;
  private readonly REFRESH_BUFFER = 0.9; // 90% životnosti tokenu
  private readonly LOCK_TIMEOUT = 5000; // 5s timeout pro zámek

  async startPeriodicRefresh(): Promise<void> {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const expiry = JSON.parse(atob(token.split('.')[1])).exp;
      const timeUntilRefresh = ((expiry - Math.floor(Date.now() / 1000)) * this.REFRESH_BUFFER) - 2; // 2 sekundy pro bezpečnost
      
      if (timeUntilRefresh <= 0) return;

      this.refreshTimer = window.setTimeout(
        () => this.performRefresh(),
        timeUntilRefresh * 1000
      );
    } catch (error) {
      console.error('Chyba při plánování refresh tokenu:', error);
    }
  }

  private async performRefresh(): Promise<void> {
    // Pokud není navigator.locks podporován, fallback na jednoduchou logiku
    if (!navigator.locks) {
      await refreshToken();
      this.startPeriodicRefresh(); // Naplánuj další
      return;
    }

    try {
      await navigator.locks.request(
        'jwt-refresh',
        { ifAvailable: true },
        async (lock) => {
          if (!lock) {
            //console.log('Jiná záložka již refreshuje token');
            // Naplánuj kontrolu za kratší dobu
            this.refreshTimer = window.setTimeout(
              () => this.startPeriodicRefresh(),
              this.LOCK_TIMEOUT
            );
            return;
          }

          const success = await refreshToken();
          if (success) {
            this.startPeriodicRefresh(); // Naplánuj další refresh
          }
        }
      );
    } catch (error) {
      console.error('Chyba při refresh tokenu:', error);
      // Zkus to znovu za 30 sekund
      this.refreshTimer = window.setTimeout(
        () => this.startPeriodicRefresh(),
        this.LOCK_TIMEOUT
      );
    }
  }

  stop(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Použití
const tokenManager = new TokenRefreshManager();
export function refreshTokenRegular(): void {
  tokenManager.startPeriodicRefresh();
  //console.log("Token refresh manager started.");
}

// Vyčištění při zavření stránky
// window.addEventListener('beforeunload', () => {
//   tokenManager.stop();
// });