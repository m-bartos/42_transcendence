import { renderNav } from "./renderNavigation";
import {renderFooter} from "./renderFooter";
import { renderMainPageContent } from "./renderMainPageContent";
import { handleMenu } from "./utils/navigation/naviUtils";
import Navigo from "navigo";
import {renderTournamentLobbyContent, TournamentStatus} from "./utils/tournament/renderTournamentLobbyContent";
import {renderTournamentContent} from "./utils/tournament/renderTournamentContent";

export async function renderFinishedTournament(router: Navigo, tournamentId: string) {
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    try {
        renderNav(app);
        await renderTournamentContent(app, router, tournamentId, TournamentStatus.Finished);
        renderFooter(app);
        handleMenu();
    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};