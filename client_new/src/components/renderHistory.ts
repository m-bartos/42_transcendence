import { api_multiplayer_games_history_url, api_splitkeyboard_games_history_url } from "../config/api_url_config";
import { AuthManager, UserData } from "../api/user";
import { MultiGamesManager, MultiGame, SplitGamesManager, MultiGamesResponse, BaseGame, SplitGame, SplitGamesResponse } from "../api/gamesManager";
import {
  createMainContainer,
  createGameSection,
  createTableWithHeaders,
  addGameRowsToTable,
  createModalForGameHistory,
  createTournamentTableWithHeaders, addRowsToTournamentTable
} from "./utils/renderHistoryUtils/renderHistoryUtils";
import Navigo from "navigo";
import {getEndedTournaments, getTournaments, TournamentStatus} from "./utils/tournament/renderTournamentLobbyContent";
import {GetTournamentsTournament} from "../types/tournament/getTournaments";
//TODO: STRANKOVANI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// === MAIN FUNCTIONS ===
export function giveMeTheContentElement(): HTMLElement {
  const container = createMainContainer();
  container.append(createGameSection('multiplayer', 'Multiplayer Game History'));
  container.append(createGameSection('splitKeyboard', 'Split Keyboard Game History', 'mt-8'));
  container.append(createGameSection('tournament', 'Tournaments History', 'mt-8'));
  return container;
}

export async function renderGameHistory(router: Navigo, parentElement: HTMLElement, originalPlayerId?: number): Promise<void> {
  const player = AuthManager.getUser();
  const playerId = originalPlayerId || player?.id || 0;

  //const parentElement = document.getElementById('contentForProfileOptions');
  if (!parentElement) {
    console.error('Parent element not found');
    return ;
  }

  parentElement.innerHTML = '';
  parentElement.append(createModalForGameHistory());
  parentElement.append(giveMeTheContentElement());

  try {
    // Paralelní načtení dat
    const [multiResponse, splitResponse] = await Promise.all([
      new MultiGamesManager(api_multiplayer_games_history_url).fetchMultiGames(playerId),
      new SplitGamesManager(api_splitkeyboard_games_history_url).fetchSplitGames(playerId)
    ]);

    const multiManager = new MultiGamesManager(api_multiplayer_games_history_url);
    const splitManager = new SplitGamesManager(api_splitkeyboard_games_history_url);

    // Vytvoření tabulek
    const setupTable = (containerId: string, games: BaseGame[], isMultiplayer: boolean = false) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.className = "w-full overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-300 rounded-md relative";
      const table = createTableWithHeaders();
      addGameRowsToTable(router, table, multiManager, games, player, isMultiplayer);
      container.append(table);
    };

    const setupTournamentTable = (containerId: string, tournaments: any) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.className = "w-full overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-300 rounded-md relative";
      const table = createTournamentTableWithHeaders();
      addRowsToTournamentTable(router, table, multiManager, tournaments);
      container.append(table);
    }

    setupTable('multiplayerTable', multiManager.getGames(multiResponse), true);
    setupTable('splitKeyboardTable', splitManager.getGames(splitResponse), false);


    const endedTournaments = await getEndedTournaments(playerId);
    setupTournamentTable('tournamentTable', endedTournaments);

  } catch (error) {
    console.error('Failed to load games:', error);
  }
}