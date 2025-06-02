import { api_multiplayer_games_history_url } from "../config/api_url_config";

interface GameResult {
    game_id: number;
    player1_id: number;
    player2_id: number;
    player1_name: string;
    player2_name: string;
    player1_score: number;
    player2_score: number;
    winner_id: number;
    loser_id: number;
    game_date: string;
    game_duration: number;
};

interface GameHistoryResponse {
    status: string;
    message: string;
    data: GameResult[];
};


class GameHistoryManager {
  private gameList: GameResult[] = [];
  private apiUrl: string;
  private isLoading: boolean = false;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION =  1000//5 * 60 * 1000; // 5 minut

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  public async fetchGames(forceRefresh: boolean = false): Promise<GameResult[]> {
    
    if (this.isLoading) {
      return this.waitForCurrentFetch();
    }

    if (this.shouldUseCachedData(forceRefresh)) {
      return this.gameList;
    }

    return this.performFetch();
  }

  private async waitForCurrentFetch(): Promise<GameResult[]> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isLoading) {
          clearInterval(checkInterval);
          resolve(this.gameList);
        }
      }, 100);
    });
  }

  private shouldUseCachedData(forceRefresh: boolean): boolean {
    const currentTime = Date.now();
    return !forceRefresh && 
           this.gameList.length > 0 && 
           (currentTime - this.lastFetchTime) < this.CACHE_DURATION;
  }

  private async performFetch(): Promise<GameResult[]> {
    this.isLoading = true;
    
    try {
      const response = await this.makeApiRequest();
      const data = await this.parseResponse(response);
      
      if (data.status === 'success') {
        this.gameList = data.data;
        this.lastFetchTime = Date.now();
        console.log('Seznam her:', this.gameList);
        return this.gameList;
      } else {
        throw new Error(`API vrátilo chybu: ${data.message}`);
      }
    } catch (error) {
      console.error('Chyba při získávání seznamu her:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
//'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
  private async makeApiRequest(): Promise<Response> {
    const dataToSend =  {
        userId: 25,
        pagination: {
            limit: 15,
            offset: 0
        }
    }
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify(dataToSend),
    };
    console.log('Request options:', requestOptions);
    const response = await fetch(this.apiUrl, requestOptions);
    if (!response.ok) {
      //console.error('Chyba při načítání her:', response.status, response.statusText);
      throw new Error(`Chyba při načítání her: ${response.status} ${response.statusText}`);
    }
    return response;
  }

  private async parseResponse(response: Response): Promise<GameHistoryResponse> {
    return await response.json();
  }

  public getLastFetchTime(): number {
    return this.lastFetchTime;
  }

  public getGameList(): GameResult[] {
    console.log('volam jen getGames');
    return [...this.gameList];
  }

  public getGameById(gameId: number): GameResult | undefined {
    return this.gameList.find(game => game.game_id === gameId);
  }

}

// Exporty

export function renderGameHistory(): HTMLDivElement {
    const gameHistoryManager = new GameHistoryManager(api_multiplayer_games_history_url);
    console.log('GameHistoryManager instance created:', gameHistoryManager);
    const gameContainer = document.createElement('div');
    gameHistoryManager.fetchGames();
    const games = gameHistoryManager.getGameList();
    console.log('Fetched games:', games);
    
    return gameContainer;
}
