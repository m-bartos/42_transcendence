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
    app.className = "w-full md:container flex flex-col justify-between mx-auto min-h-dvh md:p-4"
    //do hlavni stranky pridame navigaci
    try {

        renderNav(app);
        //take obsah hlavni stranky
        renderMainPageContent(app);
        ///a na konec footer
        renderFooter(app);
        handleMenu();




    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};