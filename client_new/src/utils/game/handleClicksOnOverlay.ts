import {
    GameType,
    playAgainButtonId,
    returnHomeButtonId,
    returnTournamentButtonId
} from "../../components/utils/game/renderHtmlGameLayout";
import {
    home_page_url,
    game_multiplayer_url,
    tournament_lobby_url,
    tournament_detail_url
} from "../../config/api_url_config";
import Navigo from "navigo";

export function handleClicksOnOverlay(router: Navigo, gameType: GameType.Multiplayer | GameType.Splitkeyboard | GameType.Tournament, tournamentId?: string) {

    if (gameType === GameType.Tournament) {
        const returnTournamentButton = document.getElementById(returnTournamentButtonId) as HTMLButtonElement
        if (!tournamentId) {
            returnTournamentButton.addEventListener('click', () => {
                router.navigate(home_page_url);
            })
        }
        else
        {
            returnTournamentButton.addEventListener('click', () => {
                router.navigate(tournament_detail_url + '/' + tournamentId);
            })
        }
        return;
    }

    const playAgainButton = document.getElementById(playAgainButtonId) as HTMLButtonElement;
    const returnHomeButton = document.getElementById(returnHomeButtonId) as HTMLButtonElement;

    playAgainButton.addEventListener('click', () => {
        // router.navigate(game_multiplayer_url);
        window.location.reload();

    })

    returnHomeButton.addEventListener('click', () => {
        router.navigate(home_page_url);
    })


}

