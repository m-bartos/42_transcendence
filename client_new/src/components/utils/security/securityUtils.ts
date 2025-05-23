import { GameSettings } from "../splitKeyboard/splitKeyboardUtils";

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