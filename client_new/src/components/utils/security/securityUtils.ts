import { GameSettings } from "../splitKeyboard/splitKeyboardUtils";
import { AuthManager } from "../../../api/user";
import { showToast } from "../loginRegistration/showToast";
import {PresenceService} from "../../../api/presenceService";

//Function for validating player names in the splitKeyboardSettings
export function validatePlayerNames(game: GameSettings): boolean {
    const usernameRegex = /^[a-zA-Z0-9_\- ]+$/;
    if (!usernameRegex.test(game.player1) || game.player1.length > 10) {
        showToast(`The Player 1 name: "${game.player1}" contains illegal characters or is too long. Letters, numbers, underscores, and hyphens are allowed.`, 'error');
        return false;
    }
    else if(!usernameRegex.test(game.player2) || game.player2.length > 10) {
        showToast(`The Player 2 name: "${game.player2}" contains illegal characters or is too long. Letters, numbers, underscores, and hyphens are allowed.`, 'error');
        return false;
    } 
    return true;
};

export function validateUsername(username: string): boolean {
    if(username.length < 3 || username.length > 10) {
        return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_\- ]+$/;
    if (!usernameRegex.test(username)) {
        showToast(`The username: "${username}" contains illegal characters. Letters, numbers, underscores, and hyphens are allowed.`, 'error');
        return false;
    }
    return true;
}

export function validateSearchUsername(username: string): boolean {
    if(username.length < 1 || username.length > 10) {
        return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_\- ]+$/;
    if (!usernameRegex.test(username)) {
        showToast(`The username: "${username}" contains illegal characters. Only letters, numbers, underscores, and hyphens are allowed.`, 'error');
        return false;
    }
    return true;
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) {
        showToast(`The email: "${email}" is not valid. Please enter a valid email address.`, 'error');
        return false;
    }
    return true;
}

export function validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        showToast(`PASSWORD - Minimum length - 8, only numbers an letters allowed, at least 1 character and 1 number.`, 'error');
        return false;
    }
    return true;
}

export function cleanDataAndReload(): void {

    const presenceService = PresenceService.getInstance();
    presenceService.onLogout();

    AuthManager.clear();
    localStorage.removeItem('jwt');
    localStorage.removeItem('splitkeyboardSettings');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
}