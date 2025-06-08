import { renderNav } from "./renderNavigation";
import {renderFooter} from "./renderFooter";
import { renderMainPageContent } from "./renderMainPageContent";
import { handleMenu } from "./utils/navigation/naviUtils";
import Navigo from "navigo";
import {renderTournamentLobbyContent} from "./utils/tournament/renderTournamentLobbyContent";

export async function renderTournamentLobby(router: Navigo) {
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    try {
        renderNav(app);
        await renderTournamentLobbyContent(app, router);
        renderFooter(app);
        handleMenu();

    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};