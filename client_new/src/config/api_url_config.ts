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
export const api_get_user_info_by_username_url: string = base_url + "/api/auth/user/find?username=";
export const api_upload_user_avatar_url: string = base_url+ "/api/upload/avatar";
export const api_user_link_account_url = base_url + "/api/auth/verify-user";


// Friends service URLs
export const api_get_all_friends_url: string = base_url+ "/api/friend/friend";
export const api_delete_friend_url: string = base_url+ "/api/friend/friend";
export const api_add_friend_url: string = base_url+ "/api/friend/friend";

// File Upload URLs
export const api_upload_avatar_url: string = base_url+ "/api/upload/avatar";

// Game Service URLs
export const api_multiplayer_games_history_url: string = base_url+ "/api/dash/multiplayer";
export const api_splitkeyboard_games_history_url: string = base_url+ "/api/dash/split";


// Tournament Service URLs
export const api_tournament_get_all_tournaments_url: string = base_url + "/api/tournament/tournaments";
export const api_tournament_get_tournament_url: string = base_url + "/api/tournament/tournaments/";
export const api_tournament_get_stats_url: string = base_url + "/api/tournament/tournaments/stats";
export const api_tournament_delete_tournament_url: string = base_url + "/api/tournament/tournaments";
export const api_tournament_create_tournament_url: string = base_url + "/api/tournament/tournaments";

// Generates url for WS based API
export function generateGameWebsocketUrl(jwt: string)
{
    return getApiBaseUrl('ws') + "/api/game/ws?playerJWT=" + jwt;
}

// Generates url for WS based API
export function generateSplitkeyboardGameWebsocketUrl(jwt: string)
{
    return getApiBaseUrl('ws') + "/api/splitkeyboard/ws?playerJWT=" + jwt;
}

// Generates url for WS based API
export function generateTournamentGameWebsocketUrl(jwt: string, gameId: string)
{
    return getApiBaseUrl('ws') + "/api/tournament/ws?playerJWT=" + jwt + '&gameId=' + gameId;
}

// Generate presence ws
export function generatePresenceWebsocketUrl()
{
    return getApiBaseUrl('ws') + "/api/presence/ws";
}

// Generates url for Static data API
export function generateStaticDataUrl(staticDataUrl: string): string {
    return getApiBaseUrl('http') + staticDataUrl;
}


// Internal URLs
// One place to define all internal urls - good for anchor tags and router
export const game_multiplayer_url = '/game/multiplayer'
export const game_splitkeyboard_url = '/game/splitkeyboard'
export const home_page_url = '/'
export const login_url = '/login'
export const profile_url = '/profile'
export const split_keyboard_url = '/splitKeyboard'
export const settings_url = '/settings'
export const tournament_lobby_url = '/tournament_lobby'
export const tournament_create_url = '/tournament_create'
export const tournament_detail_url = 'tournament'
export const tournament_game_url = 'tournament_game'
//

//URL for the friend profile
export const friend_profile_url = 'friends_profile';