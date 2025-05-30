/**
 * Returns the base API URL depending on the environment and optionally provided protocol.
 *
 * - In production (non-localhost), returns the current page's protocol and hostname.
 * - In development (localhost), constructs the base URL using the specified protocol.
 *   - If `protocol` is `'https:'`, returns `'https://localhost'`.
 *   - If `protocol` is `'ws'`, returns `'ws://localhost'`.
 *   - Defaults to `'http://localhost'` if protocol is undefined or unrecognized.
 *
 * @param {string} [protocol] - Optional protocol identifier ('http', 'https:', 'ws').
 * @returns {string} The computed base API URL.
 */
function getApiBaseUrl(protocol?: string): string {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}`;
    }
    if (protocol) {
        if (protocol === 'https:') {
            return 'https://localhost';
        } else if (protocol === 'ws') {
            return 'ws://localhost';
        }
    }
    return 'http://localhost';
}


export const base_url: string = getApiBaseUrl();

// Auth Service URLs
export const api_login_url: string = base_url+ "/api/auth/login";
export const api_register_url: string = base_url+ "/api/auth/user";
export const api_getUserInfo_url: string = base_url+ "/api/auth/user/info";
export const api_get_all_user_session_url: string = base_url+ "/api/auth/sessions";
export const api_refresh_token_url: string = base_url+ "/api/auth/user/refresh";
export const api_user_logout_url: string = base_url+ "/api/auth/logout";
export const api_logout_all_sessions_url: string = base_url + "/api/auth/sessions/logout/all";
export const api_delete_user_url: string = base_url+ "/api/auth/user";
export const api_update_user_url: string = base_url+ "/api/auth/user";
export const api_update_user_password_url: string = base_url+ "/api/auth/user/password";
export const api_get_user_info_by_id_url: string = base_url+ "/api/auth/user/info";
export const api_upload_user_avatar_url: string = base_url+ "/api/upload/avatar";


// Friends service URLs
export const api_get_all_friends_url: string = base_url+ "/api/friend/friend";
export const api_delete_friend_url: string = base_url+ "/api/friend/friend";
export const api_add_friend_url: string = base_url+ "/api/friend/friend";

// File Upload URLs
export const api_upload_avatar_url: string = base_url+ "/api/upload/avatar";


// Generates url for WS based API
export function generateGameWebsocketUrl(jwt: string)
{
    return getApiBaseUrl('ws') + "/api/game/ws?playerJWT=" + jwt;
}

// Generates url for Static data API
export function generateStaticDataUrl(staticDataUrl: string): string {
    return getApiBaseUrl('http') + staticDataUrl;
}


// Internal URLs
// One place to define all internal urls - good for anchor tags and router
export const game_multiplayer_url = '/game/multiplayer'
export const home_page_url = '/'
export const login_url = '/login'
export const profile_url = '/profile'
export const split_keyboard_url = '/splitKeyboard'
export const settings_url = '/settings'

//


