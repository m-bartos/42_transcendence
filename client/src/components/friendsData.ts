import { getApiBaseUrl } from "../auth.js";

// Definice typů pro API odpověď
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
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minut v milisekundách
    
    constructor(apiUrl: string = `${getApiBaseUrl()}/api/friend/friend`) {
      this.apiUrl = apiUrl;
    }
    
    /**
     * Získá seznam přátel ze serveru
     * @param userId ID uživatele, pro kterého chceme získat seznam přátel
     * @param forceRefresh Vynutit obnovení dat i když je cache platná
     * @returns Promise s polem přátel
     */
    //public async fetchFriends(userId: number, forceRefresh: boolean = false): Promise<Friend[]> {
    public async fetchFriends(forceRefresh: boolean = false): Promise<Friend[]> {
      // Pokud již načítáme data, vrátíme aktuální Promise
      if (this.isLoading) {
        return new Promise((resolve) => {
          // Kontrolujeme každých 100ms, zda už jsou data načtená
          const checkInterval = setInterval(() => {
            if (!this.isLoading) {
              clearInterval(checkInterval);
              resolve(this.friendsList);
            }
          }, 100);
        });
      }
      
      const currentTime = Date.now();
      // Pokud máme platná data v cache a nenutíme refresh, vrátíme je
      if (!forceRefresh && this.friendsList.length > 0 && 
          (currentTime - this.lastFetchTime) < this.CACHE_DURATION) {
        return this.friendsList;
      }
      
      this.isLoading = true;
      
      try {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
        };
        const response = await fetch(`${this.apiUrl}`, requestOptions);
        //const response = await fetch(`${this.apiUrl}?userId=${userId}`);
        
        if (!response.ok) {
          console.error('Chyba při načítání přátel:', response.status, response.statusText);
          throw new Error(`Chyba při načítání přátel: ${response.status} ${response.statusText}`);
        }
        
        const data: FriendListResponse = await response.json();
        
        if (data.status === 'success') {
          this.friendsList = data.data;
          this.lastFetchTime = currentTime;
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
    public getLastFetchTime(): number {
      return this.lastFetchTime;
    }
    
    /**
     * Vrátí uložený seznam přátel bez volání API
     * @returns Pole přátel nebo prázdné pole, pokud ještě nebyla data načtena
     */
    public getFriends(): Friend[] {
      // Pokud ještě nebyla data načtena, vrátíme prázdné pole
      return [...this.friendsList];
    }
    
    /**
     * Vyhledá přítele podle ID
     * @param friendId ID přítele, kterého hledáme
     * @returns Přítel nebo undefined, pokud nebyl nalezen
     */
    public getFriendById(friendId: number): Friend | undefined {
      return this.friendsList.find(friend => friend.friend_id === friendId);
    }
    
    /**
     * Vyhledá přítele podle uživatelského jména
     * @param username Uživatelské jméno přítele
     * @returns Přítel nebo undefined, pokud nebyl nalezen
     */
    public getFriendByUsername(username: string): Friend | undefined {
      return this.friendsList.find(friend => 
        friend.friend_username.toLowerCase() === username.toLowerCase()
      );
    }
    
    /**
     * Filtruje přátele podle online statusu
     * @param status Online status, podle kterého chceme filtrovat
     * @returns Pole přátel s daným statusem
     */
    public getFriendsByStatus(status: 'online' | 'offline'): Friend[] {
      return this.friendsList.filter(friend => friend.online_status === status);
    }
    
    /**
     * Aktualizuje online status přítele
     * @param friendId ID přítele
     * @param status Nový online status
     * @returns true pokud byla aktualizace úspěšná, jinak false
     */
    public updateFriendStatus(friendId: number, status: 'online' | 'offline'): boolean {
      const friendIndex = this.friendsList.findIndex(friend => friend.friend_id === friendId);
      
      if (friendIndex !== -1) {
        this.friendsList[friendIndex].online_status = status;
        return true;
      }
      
      return false;
    }
  }
  
  // Vytvoříme jednu instanci, kterou můžeme exportovat a používat v celé aplikaci
  const friendsManager = new FriendsManager();
  
  export { 
    Friend, 
    FriendListResponse, 
    friendsManager,
    FriendsManager  // Exportujeme i třídu pro případné vytvoření nových instancí
  };
  
  // Příklad použití v jiných souborech:
  /*
  import { friendsManager } from './friendsApi';
  
  // V async funkci
  async function loadFriends() {
    try {
      // Načtení přátel pro uživatele s ID 1
      const friends = await friendsManager.fetchFriends(1);
      console.log('Seznam přátel:', friends);
      
      // Získání pouze online přátel
      const onlineFriends = friendsManager.getFriendsByStatus('online');
      console.log('Online přátelé:', onlineFriends);
    } catch (error) {
      console.error('Chyba:', error);
    }
  }
  
  // Nebo jednoduché získání již načtených přátel
  function displayFriends() {
    const currentFriends = friendsManager.getFriends();
    // Zobrazit přátele v UI
  }
  */