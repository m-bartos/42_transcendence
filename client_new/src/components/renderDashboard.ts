import { MultiGamesManager } from "../api/gamesManager";
import { api_multiplayer_games_history_url } from "../config/api_url_config";
import {createMainContainer, getPlayerData, showErrorMessage, renderDashboardContent} from "./utils/dashboard/dashboardUtils";


export async function renderDashBoardContent(parentElement: HTMLElement, originalPlayerId?: number): Promise<void> {
    //const parentElement = document.getElementById('contentForProfileOptions');
    if (!parentElement) {
        console.error('Parent element not found');
        return;
    }

    parentElement.innerHTML = '';
    const container = createMainContainer();
    parentElement.append(container);

    try {
        const player = await getPlayerData(originalPlayerId);
        if (!player) {
            showErrorMessage(container, 'No player data available.');
            return;
        }

        const multiManager = new MultiGamesManager(api_multiplayer_games_history_url);
        const multiResponse = await multiManager.fetchMultiGames(player.id);
        const games = multiManager.getGames(multiResponse);

        if (!games || games.length === 0) {
            showErrorMessage(container, 'No multiplayer games found for this player.');
            return;
        }

        const playerStats = multiManager.getPlayerStats(games, player.id);

        renderDashboardContent(container, player, playerStats, multiManager);

    } catch (error) {
        console.error('Failed to load dashboard content:', error);
        showErrorMessage(container, 'Failed to load dashboard content.');
    }
}
