import { api_login_url } from "../config/api_url_config";
import { ApiErrors} from "../errors/apiErrors";
import { cleanDataAndReload } from "../components/utils/security/securityUtils";
import { checkAuth } from "./checkAuth";
import { api_user_logout_url, api_logout_all_sessions_url } from "../config/api_url_config";
import { showToast, hideToast } from "../components/utils/loginRegistration/showToast";
import { refreshTokenRegular } from "../components/utils/refreshToken/refreshToken";

export async function login(username: string, password: string): Promise<{mfa: boolean; message: string; jwt: string }> {
    const userData = {
        username: username,
        password: password,
    }

    const body = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    }

    try
    {
        const response = await fetch(api_login_url, body);
        const { message, data } = await response.json();
        if (response.ok) {
            if (data && data.mfa === false) {
                window.localStorage.setItem("jwt", data.token);
                refreshTokenRegular();
                return ({mfa: data.mfa, message:message, jwt: data.token});
            }
            else if (data && data.mfa === true) {
                window.localStorage.setItem("mfa_jwt", data.token);
                return ({mfa: data.mfa, message:message, jwt: data.token});
            }
            else {
                throw new ApiErrors(response.status, 'no data received');
            }
        }
        else if (response.status === 400) {
            throw new ApiErrors(response.status, message, null);
        }
        else if (response.status === 401) {
            throw new ApiErrors(response.status, message, null);
        }
        return ({mfa: data.mfa, message: message, jwt: data.token});
    }
    catch (error: any) {
        throw error;
    }
}

export async function logout() {
    if(checkAuth()) {
        let loadingToast: HTMLElement | null = null;
        
        try {
            // Zobrazit loading toast
            loadingToast = showToast("Logging out...", 'loading');
            
            const requestOptions = {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            }

            const response = await fetch(api_user_logout_url, requestOptions);
            
            if (response.status === 200) {
                cleanDataAndReload();
            }
            else if(!response.ok) {
                hideToast();
                showToast("Logout failed, But don't worry, your data are safe. You will now be redirected to the LogIn page", 'error');
                setTimeout(() => {
                    cleanDataAndReload();
                }, 3000);
            }
        }
        catch (error) {
            // Síťová chyba nebo jiný problém s fetch
            hideToast();
            console.error('Network error during logout:', error);
            showToast("Network error, But don't worry, your data are safe. You will now be redirected to the LogIn page", 'error');
            setTimeout(() => {
                cleanDataAndReload();
            }, 3000);
        }
    }
    else {
        showToast("Session expired...", 'error');
        setTimeout(() => {
            cleanDataAndReload();
        }, 3000);
    }
}

export async function logoutFromAllSessions() {
    if(checkAuth()) {
        let loadingToast: HTMLElement | null = null;
        
        try {
            loadingToast = showToast("Logging out from all sessions...", 'loading');
            
            const requestOptions = {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            };

            const response = await fetch(api_logout_all_sessions_url, requestOptions);
            
            if (response.status === 200) {
                hideToast();
                showToast("Logged out from all session successfully!", 'success');
                setTimeout(() => {
                    cleanDataAndReload();
                }, 1500);
            }
            else if(!response.ok) {
                hideToast();
                showToast("Logout failed, But don't worry, your data are safe. You will now be redirected to the LogIn page", 'error');
                setTimeout(() => {
                    cleanDataAndReload();
                }, 3000);
            }
        }
        catch (error) {
            // Síťová chyba nebo jiný problém s fetch
            hideToast();
            console.error('Network error during logout:', error);
            showToast("Network error, But don't worry, your data are safe. You will now be redirected to the LogIn page", 'error');
            setTimeout(() => {
                cleanDataAndReload();
            }, 3000);
        }
    }
    else {
        showToast("Session expired...", 'error');
        setTimeout(() => {
            cleanDataAndReload();
        }, 3000);
    }
}