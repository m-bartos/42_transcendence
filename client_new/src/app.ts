import { setPageTitle } from "./utils/utils.js";
import { renderLoginRegistration } from "./components/renderLoginRegistration";
import { renderHomePage } from "./components/renderHomePage2";
import { renderGameMultiplayer } from "./components/renderGameMultiplayer";
import { generateSplitkeyboardGameWebsocketUrl } from "./config/api_url_config";
import {renderGameSplitkeyboard} from "./components/renderGameSplitkeyboard";
import { renderProfile } from "./components/renderProfile";
import { renderSplitKeyboardDetails } from "./components/splitKeyboardDetails";
import { renderSettings } from "./components/renderSettings";
import { checkAuth } from "./api/checkAuth.js";
import {home_page_url, split_keyboard_url, login_url, game_multiplayer_url, profile_url, settings_url, game_splitkeyboard_url, generateGameWebsocketUrl} from "./config/api_url_config";
import Navigo from "navigo";
import { WebSocketHandler } from "./api/webSocketHandler";
import { refreshTokenRegular } from "./components/utils/refreshToken/refreshToken";

setPageTitle("Pong");



// Initialize WS for having the ability to control it from within the router!!
let token = localStorage.getItem('jwt')!;
let gameDataFromServer: WebSocketHandler;
let gameDataFromServer2: WebSocketHandler;

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
            } else {
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
        console.log("Profile page");
        renderSettings(router);
    })
    .on(game_multiplayer_url, (Match) => {
        console.log("Multiplayer page Handler");
        console.log(Match);
        token = localStorage.getItem('jwt')!;
        gameDataFromServer = new WebSocketHandler(generateGameWebsocketUrl(token));
        // TODO: handle the case when there is problem with websocket opening
        // - for example server down -> error message?
        // - do not execute renderGameMultiplayer in this case and redirect to homepage?
        renderGameMultiplayer(router, gameDataFromServer);
    }, {
        leave: (done) => {
            console.log("Multiplayer page Leave hook");
            gameDataFromServer.closeWebsocket();
            done();
        }
    });
    router.on(game_splitkeyboard_url, () => {
        console.log("Splitkeyboard page Handler");
        token = localStorage.getItem('jwt')!;
        gameDataFromServer2 = new WebSocketHandler(generateSplitkeyboardGameWebsocketUrl(token));
        // TODO: handle the case when there is problem with websocket opening
        // - for example server down -> error message?
        // - do not execute renderGameMultiplayer in this case and redirect to homepage?
        renderGameSplitkeyboard(router, gameDataFromServer2);
    }, {
        leave: (done) => {
            console.log("Splitkeyboard page Leave hook");
            gameDataFromServer2.closeWebsocket();
            done();
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
