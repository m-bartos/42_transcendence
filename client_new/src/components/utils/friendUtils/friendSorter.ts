import {Friend, FriendsManager} from './friends';

// Třída pro řazení přátel
export class FriendsSorter {
  private usernameSortAsc = true;
  private statusSortOnlineFirst = true;

  public sortByUsername(friends: Friend[]): Friend[] {
    const sorted = friends.sort((a, b) => {
      const comparison = a.friend_username.localeCompare(b.friend_username);
      return this.usernameSortAsc ? comparison : -comparison;
    });
    
    this.usernameSortAsc = !this.usernameSortAsc;
    return sorted;
  }

  public sortByStatus(friends: Friend[]): Friend[] {
    const sorted = friends.sort((a, b) => {
      const aOnline = a.online_status === 'online' ? 1 : 0;
      const bOnline = b.online_status === 'online' ? 1 : 0;
      
      if (this.statusSortOnlineFirst) {
        return bOnline - aOnline; // Online první
      } else {
        return aOnline - bOnline; // Offline první
      }
    });
    
    this.statusSortOnlineFirst = !this.statusSortOnlineFirst;
    return sorted;
  }

//   public getUsernameSortIndicator(): string {
//     return this.usernameSortAsc ? '▽▲' : '▼△';
//   }

//   public getStatusSortIndicator(): string {
//     return this.statusSortOnlineFirst ? '🟢' : '🔴';
//   }
}