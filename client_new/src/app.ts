import { setPageTitle } from "./utils/utils.js";
import { renderLoginRegistration } from "./components/renderLoginRegistration.js";
import { renderHomePage } from "./components/renderHomePage2";
import { renderGameMultiplayer } from "./components/renderGameMultiplayer";
import { checkAuth } from "./utils/checkAuth.js";
import {
    home_page_url,
    login_url,
    game_multiplayer_url,
    generateGameWebsocketUrl,
    game_splitkeyboard_url, generateSplitkeyboardGameWebsocketUrl
} from "./config/api_url_config";
import { clearSessionData } from "./utils/clearSessionData";
import Navigo from "navigo";
import { WebSocketHandler } from "./api/webSocketHandler";
import {renderGameSplitkeyboard} from "./components/renderGameSplitkeyboard";

setPageTitle("Pong");

// ToDo: implement cleanup session!
//clearSessionData();


// Initialize WS for having the ability to control it from within the router!!
const token = localStorage.getItem('jwt')!;
let gameDataFromServer: WebSocketHandler;
let gameDataFromServer2: WebSocketHandler;

try {
    const router = new Navigo("/");
    router.on(login_url, () => {
        console.log("Login page");
        renderLoginRegistration(router);
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
    });
    router.on(game_multiplayer_url, (Match) => {
        console.log("Multiplayer page Handler");
        console.log(Match);
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
        gameDataFromServer = new WebSocketHandler(generateSplitkeyboardGameWebsocketUrl(token));
        // TODO: handle the case when there is problem with websocket opening
        // - for example server down -> error message?
        // - do not execute renderGameMultiplayer in this case and redirect to homepage?
        renderGameSplitkeyboard(router, gameDataFromServer);
    }, {
        leave: (done) => {
            console.log("Splitkeyboard page Leave hook");
            gameDataFromServer.closeWebsocket();
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
