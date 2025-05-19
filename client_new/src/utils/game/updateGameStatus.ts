import {gameStatusId} from "../../components/utils/game/renderHtmlGameLayout";

export function updateGameStatus(status: string) {
    const gameStatus = document.getElementById(gameStatusId) as HTMLDivElement
    if (gameStatus) {
        gameStatus.classList.remove('hidden'); // Shows/hides the element
        gameStatus.textContent = status;
    }
}