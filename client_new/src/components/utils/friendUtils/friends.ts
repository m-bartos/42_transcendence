
import { api_get_all_friends_url, api_delete_friend_url } from '../../../config/api_url_config';
// Definice typů
interface Friend {
  user_id: number;
  friend_id: number;
  online_status: 'online' | 'offline';
  friend_username: string;
  avatar_url: string;
}

interface FriendListResponse {
  status: string;
  message: string;
  data: Friend[];
}

// Třída pro správu přátel
class FriendsManager {
  private friendsList: Friend[] = [];
  private apiUrl: string;
  private isLoading: boolean = false;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minut

  constructor(apiUrl: string = api_get_all_friends_url) {
    this.apiUrl = apiUrl;
  }

  public async fetchFriends(forceRefresh: boolean = false): Promise<Friend[]> {
    
    if (this.isLoading) {
      return this.waitForCurrentFetch();
    }

    if (this.shouldUseCachedData(forceRefresh)) {
      return this.friendsList;
    }

    return this.performFetch();
  }

  private async waitForCurrentFetch(): Promise<Friend[]> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isLoading) {
          clearInterval(checkInterval);
          resolve(this.friendsList);
        }
      }, 100);
    });
  }

  private shouldUseCachedData(forceRefresh: boolean): boolean {
    const currentTime = Date.now();
    return !forceRefresh && 
           this.friendsList.length > 0 && 
           (currentTime - this.lastFetchTime) < this.CACHE_DURATION;
  }

  private async performFetch(): Promise<Friend[]> {
    this.isLoading = true;
    
    try {
      const response = await this.makeApiRequest();
      const data = await this.parseResponse(response);
      
      if (data.status === 'success') {
        this.friendsList = data.data;
        this.lastFetchTime = Date.now();
        console.log('Seznam přátel:', this.friendsList);
        return this.friendsList;
      } else {
        throw new Error(`API vrátilo chybu: ${data.message}`);
      }
    } catch (error) {
      console.error('Chyba při získávání seznamu přátel:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  private async makeApiRequest(): Promise<Response> {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
    };
    
    const response = await fetch(this.apiUrl, requestOptions);
    
    if (!response.ok) {
      console.error('Chyba při načítání přátel:', response.status, response.statusText);
      throw new Error(`Chyba při načítání přátel: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  private async parseResponse(response: Response): Promise<FriendListResponse> {
    return await response.json();
  }

  public getLastFetchTime(): number {
    return this.lastFetchTime;
  }

  public getFriends(): Friend[] {
    console.log('volam jen getFriends');
    return [...this.friendsList];
  }

  public getFriendById(friendId: number): Friend | undefined {
    return this.friendsList.find(friend => friend.friend_id === friendId);
  }

  public getFriendByUsername(username: string): Friend | undefined {
    return this.friendsList.find(friend => 
      friend.friend_username.toLowerCase() === username.toLowerCase()
    );
  }

  public getFriendsByStatus(status: 'online' | 'offline'): Friend[] {
    return this.friendsList.filter(friend => friend.online_status === status);
  }

  public updateFriendStatus(friendId: number, status: 'online' | 'offline'): boolean {
    const friendIndex = this.friendsList.findIndex(friend => friend.friend_id === friendId);
    
    if (friendIndex !== -1) {
      this.friendsList[friendIndex].online_status = status;
      return true;
    }
    
    return false;
  }

  public async removeFriendFromList(friendId: number): Promise<boolean> {
    try {
      const response = await fetch(api_delete_friend_url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "friend_id": friendId,
        })
      });
      
      const friendDel = await response.json();
      console.log(`deleting friend from list status: ${response.status}`);
      console.log(`deleting friend from list message: ${friendDel.message}`);
      
      if (friendDel.status !== "success") {
        console.error(`Error deleting friend: ${friendDel.message}`);
        return false;
      } else {
        console.log(`Deleting from a list should be ok: ${friendDel.message}`);
        return true;
      }
    } catch (error) {
      console.error('Error deleting friend:', error);
      return false;
    }
  }
}

// Vytvoříme jednu instanci manageru
const friendsManager = new FriendsManager();
// Exporty
export { 
  Friend, 
  FriendListResponse, 
  friendsManager,
  FriendsManager
};