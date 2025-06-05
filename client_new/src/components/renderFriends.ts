import { base_url } from "../config/api_url_config";
import { friendsManager, Friend, FriendsManager } from "./utils/friendUtils/friends";
import { FriendsSorter } from "./utils/friendUtils/friendSorter";


// Třída pro vytváření HTML elementů
class FriendsTableBuilder {
  private container: HTMLDivElement;
  private refreshButton: HTMLButtonElement;
  private sorter: FriendsSorter;

  constructor(private friendsManager: FriendsManager) {
    this.container = document.createElement('div');
    this.container.className = 'w-full mx-auto';
    this.sorter = new FriendsSorter();
    this.refreshButton = this.createRefreshButton();
    console.log(`friendsManager:`, this.friendsManager);
  }

  private createRefreshButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = 'Reload list';
    button.className = 'tech-button px-4 py-2 my-3';
    button.addEventListener('click', () => this.handleRefresh());
    return button;
  }

  private async handleRefresh(): Promise<void> {
    try {
      this.setButtonLoadingState();
      await this.friendsManager.fetchFriends(true);
      this.replaceContainer();
    } catch (error) {
      this.setButtonErrorState();
      this.showError();
    }
  }

  private setButtonLoadingState(): void {
    this.refreshButton.textContent = 'Loading...';
    this.refreshButton.disabled = true;
    this.refreshButton.className = 'tech-button py-2 px-4 my-3 cursor-not-allowed';
  }

  private setButtonErrorState(): void {
    this.refreshButton.textContent = 'Reload list (Error)';
    this.refreshButton.disabled = false;
    this.refreshButton.className = 'mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors';
  }

  private showError(): void {
    const errorElement = document.createElement('div');
    errorElement.className = 'mb-4 p-3 bg-red-100 text-red-700 rounded';
    errorElement.textContent = 'Update Error';
    
    if (this.container.firstChild) {
      this.container.insertBefore(errorElement, this.container.firstChild.nextSibling);
    } else {
      this.container.append(errorElement);
    }
  }

  private replaceContainer(): void {
    const newContainer = renderFriends();
    if (this.container.parentElement) {
      this.container.parentElement.replaceChild(newContainer, this.container);
    }
  }

  public createTable(): HTMLElement {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'overflow-x-auto border-1 border-gray-200';
    
    const table = document.createElement('table');
    table.className = 'w-full table-auto border-collapse';
    
    const thead = this.createTableHeader();
    const tbody = this.createTableBody();
    
    table.append(thead);
    table.append(tbody);
    tableContainer.append(table);
    
    return tableContainer;
  }

  private createTableHeader(): HTMLElement {
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-100';
    
    const headerRow = document.createElement('tr');
    headerRow.className = 'divide-x divide-gray-200';
    
    const headers = [
      { text: 'Avatar', sortable: false },
      { text: 'Username', sortable: true },
      { text: 'Status', sortable: true },
      { text: 'Actions', sortable: false }
    ];
    
    headers.forEach(header => {
      const th = this.createHeaderCell(header);
      headerRow.append(th);
    });
    
    thead.append(headerRow);
    return thead;
  }

  private createHeaderCell(header: { text: string, sortable: boolean }): HTMLElement {
    const th = document.createElement('th');
    th.textContent = header.text;
    th.className = 'px-4 py-3 text-center font-medium border-b-2 border-gray-200';
    
    if (header.sortable) {
      this.makeSortableHeader(th, header.text);
    }
    
    return th;
  }

  private makeSortableHeader(th: HTMLElement, headerText: string): void {
    th.style.cursor = 'pointer';
    th.className += ' hover:bg-gray-200 transition-colors';
    th.title = `Klikněte pro seřazení podle ${headerText.toLowerCase()}`;
    
    th.addEventListener('click', () => {
      const friends = this.friendsManager.getFriends();
      let sortedFriends: Friend[];
      
      if (headerText === 'Username') {
        sortedFriends = this.sorter.sortByUsername([...friends]);
        //th.textContent = `Username ${this.sorter.getUsernameSortIndicator()}`;
      } else if (headerText === 'Status') {
        sortedFriends = this.sorter.sortByStatus([...friends]);
        //th.textContent = `Status ${this.sorter.getStatusSortIndicator()}`;
      } else {
        return;
      }
      
      this.rerenderTableBody(sortedFriends);
    });
  }

  private createTableBody(): HTMLElement {
    const tbody = document.createElement('tbody');
    const friends = this.friendsManager.getFriends();
    
    if (friends.length === 0) {
      this.handleEmptyFriendsList(tbody);
    } else {
      this.populateTableBody(tbody, friends);
    }
    
    return tbody;
  }

  private handleEmptyFriendsList(tbody: HTMLElement): void {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 4;
    emptyCell.className = 'px-4 py-8 text-center';
    
    if (this.friendsManager.getLastFetchTime() === 0) {
      emptyCell.textContent = 'List of following users loading...';
      this.loadInitialFriends(emptyCell);
    } else {
      emptyCell.textContent = 'No followed users found. Click Reload to try again.';
    }
    
    emptyRow.append(emptyCell);
    tbody.append(emptyRow);
  }

  private async loadInitialFriends(emptyCell: HTMLElement): Promise<void> {
    try {
      const updatedFriends = await this.friendsManager.fetchFriends();
      
      if (updatedFriends.length === 0) {
        emptyCell.textContent = 'No followed users found. Click Reload to try again.';
      } else {
        this.replaceContainer();
      }
    } catch (error) {
      emptyCell.textContent = `Loading error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      emptyCell.className = 'px-4 py-8 text-center text-red-500';
    }
  }

  private populateTableBody(tbody: HTMLElement, friends: Friend[]): void {
    friends.forEach(friend => {
      const row = this.createFriendRow(friend);
      tbody.append(row);
    });
  }
  
  private createFriendRow(friend: Friend): HTMLElement {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-200 hover:bg-gray-50 transition-colors';
    
    const avatarCell = this.createAvatarCell(friend);
    const usernameCell = this.createUsernameCell(friend);
    const statusCell = this.createStatusCell(friend);
    const actionsCell = this.createActionsCell(friend);
    
    row.append(avatarCell);
    row.append(usernameCell);
    row.append(statusCell);
    row.append(actionsCell);
    
    row.addEventListener('click', () => renderSingleFriendProfile(friend.friend_id, friend.friend_username));

    return row;
  }

  private createAvatarCell(friend: Friend): HTMLElement {
    const cell = document.createElement('td');
    cell.className = 'px-4 py-3 w-16';
    
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'w-10 h-10 mx-auto rounded-full bg-gray-200 flex items-center justify-center';
    
    const img = document.createElement('img');
    img.src = friend.avatar_url || `${base_url}/src/assets/images/defaultAvatar.png`;
    img.alt = `${friend.friend_username} avatar`;
    img.className = 'w-full h-full rounded-full object-cover';
    
    img.onerror = () => {
      console.error('Loading Avatar image failed (? 404 ?)');
      img.src = `${base_url}/src/assets/images/defaultAvatar.png`;
    };
    
    avatarContainer.append(img);
    cell.append(avatarContainer);
    
    return cell;
  }

  private createUsernameCell(friend: Friend): HTMLElement {
    const cell = document.createElement('td');
    cell.textContent = friend.friend_username;
    cell.className = 'px-4 py-3 font-medium text-center cursor-pointer hover:bg-white';
    return cell;
  }

  private createStatusCell(friend: Friend): HTMLElement {
    const cell = document.createElement('td');
    cell.className = 'px-4 py-3';
    
    const statusContainer = document.createElement('div');
    statusContainer.className = 'flex items-center justify-center';
    
    const statusDot = document.createElement('span');
    const colorClass = friend.online_status === 'online' ? 'bg-green-500' : 'bg-gray-400';
    statusDot.className = `inline-block w-2 h-2 rounded-full mr-2 ${colorClass}`;
    
    const statusText = document.createElement('span');
    statusText.textContent = friend.online_status;
    statusText.className = '';
    
    statusContainer.append(statusDot);
    statusContainer.append(statusText);
    cell.append(statusContainer);
    
    return cell;
  }

  private createActionsCell(friend: Friend): HTMLElement {
    const cell = document.createElement('td');
    cell.className = 'px-4 py-3 text-center';
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'no-button px-2 lg:px-8 py-1';
    
    removeButton.addEventListener('click', async () => {
      await this.friendsManager.removeFriendFromList(friend.friend_id);
      setTimeout(() => this.handleRefresh(), 10);
    });
    
    cell.append(removeButton);
    return cell;
  }

  private rerenderTableBody(sortedFriends: Friend[]): void {
    const tbody = this.container.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (sortedFriends.length === 0) {
      this.handleEmptyFriendsList(tbody);
    } else {
      this.populateTableBody(tbody, sortedFriends);
    }
  }

  public build(): HTMLElement {
    this.container.append(this.refreshButton);
    
    const table = this.createTable();
    this.container.append(table);
    
    // Počáteční vykreslení s aktuálními daty
    const initialFriends = this.friendsManager.getFriends();
    this.rerenderTableBody(initialFriends);
    
    return this.container;
  }
}

// Hlavní funkce pro vykreslení
export function renderFriends(): HTMLDivElement {
  const builder = new FriendsTableBuilder(friendsManager);
  return builder.build() as HTMLDivElement;
}



export  function renderSingleFriendProfile(friendId: number, friendUsername: string): void {
  console.log(`You clicked on a friend with ID: ${friendId} and username: ${friendUsername}`);
};

