import { renderNav } from "./renderNavigation";
import {renderFooter} from "./renderFooter";
import { renderMainPageContent } from "./renderMainPageContent";
import { handleMenu } from "./utils/navigation/naviUtils";
import Navigo from "navigo";

export function renderHomePage(router: Navigo) {
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    app.className = "min-w-[500px] w-full md:container flex flex-col justify-between min-h-dvh md:p-4 relative mx-auto";
    try {
        //do hlavni stranky pridame navigaci
        renderNav(app);
        //take obsah hlavni stranky
        renderMainPageContent(app, router);
        ///a na konec footer
        renderFooter(app);
        //zde je potreba pridat event listener na logout a ostatni menu funkce a listenery
        handleMenu();

    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};