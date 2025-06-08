import {playAgainButtonId, returnHomeButtonId} from "../../components/utils/game/renderHtmlGameLayout";
import {home_page_url, game_multiplayer_url, active_tournament_url} from "../../config/api_url_config";
import Navigo from "navigo";

export function handleClicksOnOverlayTournament(router: Navigo, tournamentId: string) {
    // const playAgainButton = document.getElementById(playAgainButtonId) as HTMLButtonElement;
    const returnHomeButton = document.getElementById(returnHomeButtonId) as HTMLButtonElement;

    // playAgainButton.addEventListener('click', () => {
    //     // router.navigate(game_multiplayer_url);
    //     window.location.reload();
    //
    // })

    returnHomeButton.addEventListener('click', () => {
        router.navigate(active_tournament_url + tournamentId);
    })
}

