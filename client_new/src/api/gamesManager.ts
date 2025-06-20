import { api_multiplayer_games_history_url, api_splitkeyboard_games_history_url } from "../config/api_url_config";
import { AuthManager, UserData } from "../api/user";

// === SHARED INTERFACES ===
interface BasePagination {
  limit: number;
  offset: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  nextOffset: number;
  prevOffset: number;
}

interface BaseGame {
  id: number;
  gameMode: string;
  endReason: string;
  playerOneUsername: string;
  playerOneScore: number;
  playerOnePaddleBounce: number;
  playerTwoUsername: string;
  playerTwoScore: number;
  playerTwoPaddleBounce: number;
  createdAt: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

// === MULTIPLAYER INTERFACES ===
interface MultiGame extends BaseGame {
  gameId: string;
  playerOneId: number;
  playerOneAvatar: string;
  playerTwoId: number;
  playerTwoAvatar: string;
  winnerId: number;
  loserId: number;
}

interface MultiGamesResponse {
  status: string;
  message: string;
  data: {
    games: MultiGame[];
    pagination: BasePagination;
  };
}

// === SPLIT KEYBOARD INTERFACES ===
interface SplitGame extends BaseGame {
  principalId: number;
  winnerUsername: string;
  loserUsername: string;
}

interface SplitGamesResponse {
  status: string;
  message: string;
  data: {
    games: SplitGame[];
    pagination: BasePagination;
  };
}

// === SHARED BASE MANAGER ===
abstract class BaseGamesManager<T extends BaseGame, R> {
  protected apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  //TODO: STARNKOVANI PREDELAT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // Společná API logika
  protected async fetchGames(playerId: number, offset: number = 0, limit: number = 100): Promise<R> {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: playerId,
        pagination: { limit, offset }
      })
    };

    const response = await fetch(this.apiUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as R;
    
    if ((data as any).status !== 'success') {
      throw new Error(`API error: ${(data as any).message}`);
    }

    const games = (data as any).data.games;
    console.log(games.length > 0 ? "data from fetch:" : "data is empty", data);
    
    return data;
  }

  // Společné utility metody
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('cs-CZ');
  }

  // Pagination helpers
  hasMorePages(pagination: BasePagination): boolean {
    return pagination.hasNext;
  }

  hasPreviousPages(pagination: BasePagination): boolean {
    return pagination.hasPrev;
  }

  getCurrentPage(pagination: BasePagination): number {
    return Math.floor(pagination.offset / pagination.limit) + 1;
  }

  getTotalPages(pagination: BasePagination): number {
    return Math.ceil(pagination.total / pagination.limit);
  }
}

// === KONKRÉTNÍ MANAGERY ===
class MultiGamesManager extends BaseGamesManager<MultiGame, MultiGamesResponse> {
  async fetchMultiGames(playerId: number, offset?: number, limit?: number): Promise<MultiGamesResponse> {
    return this.fetchGames(playerId, offset, limit);
  }

  getGames(response: MultiGamesResponse): MultiGame[] {
    return response.data.games;
  }

  extractPagination(response: MultiGamesResponse): BasePagination {
    return response.data.pagination;
  }

  getEnemyScore(games: MultiGame[], playerId: number): number {
    return games.reduce((total, game) => {
      if (game.playerOneId === playerId) {
        return total + game.playerTwoScore;
      } else if (game.playerTwoId === playerId) {
        return total + game.playerOneScore;
      }
      return total;
    }, 0);
  }

  getUniqueOpponents(games: MultiGame[], playerId: number): Set<number> {
    const opponents = new Set<number>();
    games.forEach(game => {
      if (game.playerOneId === playerId) {
        opponents.add(game.playerTwoId);
      } else if (game.playerTwoId === playerId) {
        opponents.add(game.playerOneId);
      }
    });
    return opponents;
  }

  getPlayerStats(games: MultiGame[], playerId: number) {
    console.log("games:", games);
    const totalEnemyScore = this.getEnemyScore(games, playerId);
    const uniqueOpponents = this.getUniqueOpponents(games, playerId);
    const playerGames = games.filter(game => 
      game.playerOneId === playerId || game.playerTwoId === playerId
    );
    
    const wins = games.filter(game => game.winnerId === playerId);
    
    const { totalScore, totalPaddleBounces, totalDuration } = playerGames.reduce((acc, game) => {
      const isPlayerOne = game.playerOneId === playerId;
      return {
        totalScore: acc.totalScore + (isPlayerOne ? game.playerOneScore : game.playerTwoScore),
        totalPaddleBounces: acc.totalPaddleBounces + (isPlayerOne ? game.playerOnePaddleBounce : game.playerTwoPaddleBounce),
        totalDuration: acc.totalDuration + game.durationSeconds
      };
    }, { totalScore: 0, totalPaddleBounces: 0, totalDuration: 0 });

    return {
      totalGames: playerGames.length,
      wins: wins.length,
      losses: playerGames.length - wins.length,
      winRate: playerGames.length > 0 ? (wins.length / playerGames.length) * 100 : 0,
      totalScore,
      totalEnemyScore,
      uniqueOpponents: uniqueOpponents.size,
      averageScore: playerGames.length > 0 ? totalScore / playerGames.length : 0,
      totalPaddleBounces,
      averageDuration: playerGames.length > 0 ? totalDuration / playerGames.length : 0
    };
  }
  getOpponentsByGameCount(games: MultiGame[], playerId: number): Array<{username: string, gameCount: number}> {
    // Mapa pro počítání her s každým soupeřem
    const opponentStats = new Map<string, number>();
    
    // Projdeme všechny hry a spočítáme hry s každým soupeřem
    games.forEach(game => {
      let opponentUsername: string | null = null;
      
      // Určíme, kdo je soupeř
      if (game.playerOneId === playerId) {
        opponentUsername = game.playerTwoUsername;
      } else if (game.playerTwoId === playerId) {
        opponentUsername = game.playerOneUsername;
      }
      
      // Pokud je hráč účastníkem hry, přičteme hru k soupeři
      if (opponentUsername) {
        const currentCount = opponentStats.get(opponentUsername) || 0;
        opponentStats.set(opponentUsername, currentCount + 1);
      }
    });
    
    // Převedeme mapu na array a seřadíme sestupně podle počtu her
    return Array.from(opponentStats.entries())
      .map(([username, gameCount]) => ({ username, gameCount }))
      .sort((a, b) => b.gameCount - a.gameCount);
  }
}

class SplitGamesManager extends BaseGamesManager<SplitGame, SplitGamesResponse> {
  async fetchSplitGames(playerId: number, offset?: number, limit?: number): Promise<SplitGamesResponse> {
    return this.fetchGames(playerId, offset, limit);
  }

  getGames(response: SplitGamesResponse): SplitGame[] {
    return response.data.games;
  }

  extractPagination(response: SplitGamesResponse): BasePagination {
    return response.data.pagination;
  }
}
// === EXPORTS ===
export {
  BaseGame,
  MultiGame,
  SplitGame,
  BasePagination as MultiPagination,
  BasePagination as SplitPagination,
  MultiGamesResponse,
  SplitGamesResponse,
  MultiGamesManager,
  SplitGamesManager
};