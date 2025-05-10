// Funkce pro získání základní URL API
function getApiBaseUrl(): string {
    // V produkčním prostředí
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Použijte stejnou doménu jako má aplikace, ale s cestou /api
        return `${window.location.protocol}//${window.location.hostname}`;
    }
    // Ve vývojovém prostředí (localhost)
    return 'http://localhost';
}

const base_url: string = getApiBaseUrl();

// Auth Service URLs
export const api_login_url: string = base_url+ "/api/auth/login";
export const api_register_url: string = base_url+ "/api/auth/user";
export const api_logout_url: string = base_url+ "/api/auth/logout";

