import { setPageTitle } from "./utils/utils.js";
import { renderLoginRegistration } from "./components/renderLoginRegistration.js";
import { renderHomePage } from "./components/renderHomePage.js";
import { renderGameMultiplayer } from "./components/renderGameMultiplayer";
import { checkAuth } from "./utils/checkAuth.js";
import { home_page_url, login_url, game_multiplayer_url } from "./config/api_url_config";
import { clearSessionData } from "./utils/clearSessionData";
import Navigo from "navigo";


setPageTitle("Pong");
// console.log("Clear session data");
//clearSessionData();


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
        console.log("Multiplayer page");
        //console.log(Match);
        renderGameMultiplayer();
    });
    // router.notFound(() => {
    //     console.log("Not Found");
    //     router.navigate(home_page_url);
    // });
    router.resolve();
} catch (error) {
    console.error("Navigo initialization error:", error);
}
