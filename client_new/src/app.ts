import { setPageTitle } from "./utils/utils.js";
import { renderLoginRegistration } from "./components/renderLoginRegistration";
import { renderHomePage } from "./components/renderHomePage2";
import { renderGameMultiplayer } from "./components/renderGameMultiplayer";
import {
    tournament_detail_url,
    generateSplitkeyboardGameWebsocketUrl,
    generateTournamentGameWebsocketUrl,
    tournament_create_url,
    tournament_game_url,
    tournament_lobby_url
} from "./config/api_url_config";
import {renderGameSplitkeyboard} from "./components/renderGameSplitkeyboard";
import { renderProfile } from "./components/renderProfile";
import { renderSplitKeyboardDetails } from "./components/splitKeyboardDetails";
import { renderSettings } from "./components/renderSettings";
import { checkAuth } from "./api/checkAuth.js";
import {
    home_page_url,
    split_keyboard_url,
    login_url,
    game_multiplayer_url,
    profile_url,
    settings_url,
    game_splitkeyboard_url,
    generateGameWebsocketUrl,
    friend_profile_url
} from "./config/api_url_config";
import Navigo from "navigo";
import { WebSocketHandler } from "./api/webSocketHandler";
import { refreshTokenRegular } from "./components/utils/refreshToken/refreshToken";
import {renderTournamentLobby} from "./components/renderTournamentLobby";
import {renderActiveTournament} from "./components/renderActiveTournament";
import {renderTournamentCreate} from "./components/renderTournamentCreate";
import {renderTournamentGame} from "./components/renderTournamentGame";
import { renderSingleFriendProfile } from "./components/renderUsersProfile.js";
import { removeSplitkeyboardPaddleMovements } from "./utils/game/sendSplitkeyboardPaddleMovements.js";


setPageTitle("Pong");

// Initialize WS for having the ability to control it from within the router!!
let token = localStorage.getItem('jwt')!;
let multiplayerWs: WebSocketHandler;
let splitKeyboardWs: WebSocketHandler;
let tournamentWs: WebSocketHandler;

try {
    const router = new Navigo("/");

    router.on(login_url, () => {
        console.log("Login page");
        renderLoginRegistration(router);
    }, {
        before: (done) => {
            if (checkAuth()) {
                done(false);
                router.navigate(home_page_url);
            } else {
                done();
            }
        }
    });
    router.hooks({
        before: (done) => {
            if (!checkAuth()) {
                done(false);
                router.navigate(login_url);
            }
            else {
                done();
            }
        }
    });
    router.on(home_page_url, () => {
        console.log("Home page");
        renderHomePage(router);
    })
        .on(split_keyboard_url, () => {
            console.log("Split keyboard page");
            renderSplitKeyboardDetails(router);
        })
        .on(profile_url, () => {
            console.log("Profile page");
            renderProfile(router);
        })
        .on(settings_url, () => {
            console.log("Settings page");
            renderSettings(router);
        })
        .on(game_multiplayer_url, (Match) => {
            console.log("Multiplayer page Handler");
            token = localStorage.getItem('jwt')!;            
            multiplayerWs = new WebSocketHandler(generateGameWebsocketUrl(token));
            // TODO: handle the case when there is problem with websocket opening
            // - for example server down -> error message?
            // - do not execute renderGameMultiplayer in this case and redirect to homepage?
            renderGameMultiplayer(router, multiplayerWs);
        }, {
            leave: (done) => {
                console.log("Multiplayer page Leave hook");
                multiplayerWs.closeWebsocket();
                done();
            }
        });
    router.on(game_splitkeyboard_url, () => {
        console.log("Splitkeyboard page Handler");
        token = localStorage.getItem('jwt')!; 
        splitKeyboardWs = new WebSocketHandler(generateSplitkeyboardGameWebsocketUrl(token));
        // TODO: handle the case when there is problem with websocket opening
        // - for example server down -> error message?
        // - do not execute renderGameMultiplayer in this case and redirect to homepage?
        renderGameSplitkeyboard(router, splitKeyboardWs);
    }, {
        leave: (done) => {
            console.log("Splitkeyboard page Leave hook");
            splitKeyboardWs.closeWebsocket();
            removeSplitkeyboardPaddleMovements();
            done();
        }
    });
    router.on(tournament_lobby_url, () => {
        renderTournamentLobby(router);
    })
    router.on(tournament_create_url, () => {
        renderTournamentCreate(router);
    })
    router.on(tournament_detail_url + '/:id', (Match) => {
            if (Match?.data?.id)
            {
                const tournamentId = Match.data.id;
                renderActiveTournament(router, tournamentId);
            }
            else
            {
                console.error('Tournament id not found. Redirecting to homepage.');
                router.navigate(home_page_url);
            }
        }
    );
    router.on(tournament_game_url + '/:tournamentId/:gameId', (Match) => {

        if (Match?.data?.gameId && Match.data.tournamentId) {
            const tournamentId = Match.data.tournamentId;
            const gameId = Match.data.gameId;
            token = localStorage.getItem('jwt')!;
            tournamentWs = new WebSocketHandler(generateTournamentGameWebsocketUrl(token, gameId)); // TODO: has to wait for the websocket. Maybe send message that the game is not found?
            renderTournamentGame(router, tournamentWs, tournamentId);
        }
        else
        {
            console.error('Game id not found. Redirecting to homepage.');
            router.navigate(home_page_url);
        }
    }, {
        leave: (done) => {
            console.log("Tournament page Leave hook");
            tournamentWs.closeWebsocket();
            removeSplitkeyboardPaddleMovements();
            done();
        }
    });
    router.on(friend_profile_url + '/:id', (Match) => {
        console.log('Friend profile page');
        if (Match?.data?.id)
        {

            const friendId = Match.data.id;
            renderSingleFriendProfile(router, friendId);
        }
        else
        {
            console.error('Friend id not found. Redirecting to homepage.');
            router.navigate(home_page_url);
        }
    });

    router.notFound(() => {
        console.log("Not Found");
        router.navigate(home_page_url);
    });
    router.resolve();

} catch (error) {
    console.error("Navigo initialization error:", error);
}

document.addEventListener('DOMContentLoaded', () => {
    // Zkontrolovat, jestli je uživatel přihlášen
    const token = localStorage.getItem('jwt');
    if (token) {
        refreshTokenRegular(); // Spustit automaticky
    }
//   else {
//     console.log("No JWT found, skipping token refresh.");
//   }
});
