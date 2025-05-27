import { GameSettings } from "../splitKeyboard/splitKeyboardUtils";
import { AuthManager } from "../../../api/user";

//Function for validating player names in the splitKeyboardSettings
export function validatePlayerNames(game: GameSettings): boolean {
    console.log('Validating player names:', game.player1," - ", game.player2);
    const usernameRegex = /^[a-zA-Z0-9_\- ]+$/;
    if (!usernameRegex.test(game.player1)) {
        alert(`The Player 1 name: "${game.player1}" contains illegal characters. Letters, numbers, underscores, and hyphens are allowed.`);
        return false;
    }
    else if(!usernameRegex.test(game.player2)){
        alert(`The Player 2 name: ${game.player2} contains illegal characters. Letters, numbers, underscores, and hyphens are allowed.`);
        return false;
    } 
    return true;
};

export function validateUsername(username: string): boolean {
    console.log('Validating username:', username);
    const usernameRegex = /^[a-zA-Z0-9_\- ]+$/;
    if (!usernameRegex.test(username)) {
        //alert(`The username: "${username}" contains illegal characters. Letters, numbers, underscores, and hyphens are allowed.`);
        return false;
    }
    return true;
}

export function validateEmail(email: string): boolean {
    console.log('Validating email:', email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) {
        alert(`The email: "${email}" is not valid. Please enter a valid email address.`);
        return false;
    }
    return true;
}

export function validatePassword(password: string): boolean {
    console.log('Validating password:', password);
    // Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        alert(`The password must be at least 8 characters long and contain at least one character and one number.`);
        return false;
    }
    return true;
}

export function cleanDataAndReload(): void {
    console.log("Cleaning session data and reloading the page.");
    AuthManager.clear();
    localStorage.removeItem('jwt');
    sessionStorage.clear();
    window.location.reload();
}