import { renderNav } from "./renderNavigation";
import {renderFooter} from "./renderFooter";
import { renderMainPageContent } from "./renderMainPageContent";
import { handleMenu } from "./utils/navigation/naviUtils";
import Navigo from "navigo";
import {renderTournamentLobbyContent} from "./utils/tournament/renderTournamentLobbyContent";
import {renderActiveTournamentContent} from "./utils/tournament/renderActiveTournamentContent";

export async function renderActiveTournament(router: Navigo, tournamentId: string) {
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    try {
        renderNav(app);
        await renderActiveTournamentContent(app, router, tournamentId);
        renderFooter(app);
        handleMenu();
    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};