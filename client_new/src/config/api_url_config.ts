function getApiBaseUrl(): string {
    return `${window.location.protocol }//${window.location.hostname}:${window.location.port}`;
}

function getApiBaseWsUrl(): string {
    if (window.location.protocol === 'https:')
    {
        return `wss://${window.location.hostname}:${window.location.port}`;
    }
    else
    {
        return `ws://${window.location.hostname}:${window.location.port}`;
    }
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
export const api_verify_mfa_url: string = base_url + "/api/auth/user/mfa";
export const api_reset_password_url: string = base_url + "/api/auth/user/reset-password";


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
export const api_tournament_get_all_ended_tournaments_url = base_url + "/api/tournament/tournaments/ended"

// Generates url for WS based API
export function generateGameWebsocketUrl(jwt: string)
{
    return getApiBaseWsUrl() + "/api/game/ws?playerJWT=" + jwt;
}

// Generates url for WS based API
export function generateSplitkeyboardGameWebsocketUrl(jwt: string)
{
    return getApiBaseWsUrl() + "/api/splitkeyboard/ws?playerJWT=" + jwt;
}

// Generates url for WS based API
export function generateTournamentGameWebsocketUrl(jwt: string, gameId: string)
{
    return getApiBaseWsUrl() + "/api/tournament/ws?playerJWT=" + jwt + '&gameId=' + gameId;
}

// Generate presence ws
export function generatePresenceWebsocketUrl()
{
    return getApiBaseWsUrl() + "/api/presence/ws";
}

// Generates url for Static data API
export function generateStaticDataUrl(staticDataUrl: string): string {
    return getApiBaseUrl() + staticDataUrl;
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

//URL for the friend profile
export const friend_profile_url = 'friends_profile';

