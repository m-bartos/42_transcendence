import Navigo from "navigo";
import { renderNav } from "./renderNavigation";
import { renderFooter } from "./renderFooter";
import { handleMenu } from "./utils/navigation/naviUtils";
import { renderProfileContent } from "./renderProfileContent";
import { handleProfileBasicFunctionality } from './utils/profileUtils/profileFunctionality';


export function renderProfile(router: Navigo) {
    document.title = "Pong - Profile";
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    app.className = "w-full md:container flex flex-col mx-auto min-h-dvh md:p-4"
    try {
        //do hlavni stranky pridame navigaci
        renderNav(app);
        //take obsah hlavni stranky
        renderProfileContent(app, router);
        ///a na konec footer
        renderFooter(app);
        //zde je potreba pridat event listener na logout a ostatni menu funkce a listenery
        handleMenu();


    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};