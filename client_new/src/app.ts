import { setPageTitle } from "./utils/utils.js";
import { renderLoginRegistration } from "./components/renderLoginRegistration.js";
import { renderHomePage } from "./components/renderHomePage.js";
import { renderGameMultiplayer } from "./components/renderGameMultiplayer";
import { checkAuth } from "./utils/checkAuth.js";
import {home_page_url, login_url, game_multiplayer_url, generateGameWebsocketUrl} from "./config/api_url_config";
import { clearSessionData } from "./utils/clearSessionData";
import Navigo from "navigo";
import { WebSocketHandler } from "./api/webSocketHandler";

setPageTitle("Pong");

// ToDo: implement cleanup session!
//clearSessionData();


// Initialize WS for having the ability to control it from within the router!!
const token = localStorage.getItem('jwt')!;
let gameDataFromServer: WebSocketHandler;

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
        renderGameMultiplayer(router, gameDataFromServer);
    }, {
        leave: (done) => {
            console.log("Multiplayer page Leave hook");
            gameDataFromServer.gameSocket?.close();
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
