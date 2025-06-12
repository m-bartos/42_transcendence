import { renderNav } from "./renderNavigation";
import {renderFooter} from "./renderFooter";
import { renderMainPageContent } from "./renderMainPageContent";
import { handleMenu } from "./utils/navigation/naviUtils";
import Navigo from "navigo";
import {renderTournamentLobbyContent} from "./utils/tournament/renderTournamentLobbyContent";
import {renderTournamentContent} from "./utils/tournament/renderTournamentContent";
import {renderCreateTournamentContent} from "./utils/tournament/renderTournamentCreateContent";

export async function renderTournamentCreate(router: Navigo) {
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    try {
        renderNav(app);
        await renderCreateTournamentContent(app, router);
        renderFooter(app);
        handleMenu();
    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};