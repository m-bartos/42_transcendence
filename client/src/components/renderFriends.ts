import { Friend, friendsManager } from './friendsData.js';

/**
 * Vykreslí seznam přátel do tabulky s využitím Tailwind CSS
 * @returns HTMLDivElement obsahující tabulku s přáteli
 */
export function renderFriends(): HTMLDivElement {
  // Vytvoříme hlavní kontejner
  const container = document.createElement('div');
  container.className = 'w-full mx-auto bg-white';
  
  // Vytvoříme tlačítko pro obnovení seznamu
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Reload list';
  refreshButton.className = 'mb-4 px-4 py-2 bg-gray-300 text-gray-800 border-1 border-gray-600 rounded hover:bg-gray-400 transition-colors';
  
  refreshButton.addEventListener('click', async () => {
    try {
      // Změníme text tlačítka během načítání
      refreshButton.textContent = 'Loading...';
      refreshButton.disabled = true;
      refreshButton.className = 'mb-4 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed';
      
      // Vynutíme obnovení dat ze serveru
      await friendsManager.fetchFriends(true);
      
      // Vytvoříme nové vykreslení
      const newContainer = renderFriends();
      
      // Nahradíme existující kontejner
      if (container.parentElement) {
        container.parentElement.replaceChild(newContainer, container);
      }
    } catch (error) {
      // V případě chyby obnovíme tlačítko
      refreshButton.textContent = 'Reload list (Error)';
      refreshButton.disabled = false;
      refreshButton.className = 'mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors';
      
      // Zobrazíme chybu
      const errorElement = document.createElement('div');
      errorElement.className = 'mb-4 p-3 bg-red-100 text-red-700 rounded';
      errorElement.textContent = `Update Error`;
      
      // Přidáme chybu před tabulku
      if (container.firstChild) {
        container.insertBefore(errorElement, container.firstChild.nextSibling);
      } else {
        container.appendChild(errorElement);
      }
    }
  });
  
  container.appendChild(refreshButton);
  
  // Vytvoříme tabulku
  const tableContainer = document.createElement('div');
  tableContainer.className = 'overflow-x-auto border-1 border-gray-200';
  
  const table = document.createElement('table');
  table.className = 'w-full table-auto border-collapse';
  
  // Vytvoříme hlavičku tabulky
  const thead = document.createElement('thead');
  thead.className = 'bg-gray-100';
  
  const headerRow = document.createElement('tr');
  headerRow.className = 'divide-x divide-gray-200';
  
  // Definujeme záhlaví tabulky
  const headers = ['Avatar', 'Username', 'Status', 'Actions'];
  
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.className = 'px-4 py-3 text-left font-medium text-gray-700 border-b-2 border-gray-200';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Vytvoříme tělo tabulky
  const tbody = document.createElement('tbody');
  
  // Získáme seznam přátel
  const friends = friendsManager.getFriends();
  
  // Pokud nemáme žádné přátele, zobrazíme informaci
  if (friends.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 4;
    emptyCell.className = 'px-4 py-8 text-center text-gray-500';
    
    // Zkontrolujeme, jestli už byl proveden pokus o načtení dat
    if (friendsManager.getLastFetchTime() === 0) {
      // Ještě nebyl proveden pokus o načtení, zkusíme načíst data
      emptyCell.textContent = 'List of folowing users loading...';
      
      // Zkusíme načíst přátele (pro uživatele s ID 1)
      friendsManager.fetchFriends()
        .then(updatedFriends => {
          if (updatedFriends.length === 0) {
            // Seznam přátel je prázdný, ale server vrátil úspěch
            emptyCell.textContent = 'No folowed users found. Click Reload to try again.';
          } else {
            // Máme přátele, aktualizujeme pohled
            const newContainer = renderFriends();
            
            // Nahradíme existující kontejner
            if (container.parentElement) {
              container.parentElement.replaceChild(newContainer, container);
            }
          }
        })
        .catch(error => {
          emptyCell.textContent = `Loading error: ${error.message}`;
          emptyCell.className = 'px-4 py-8 text-center text-red-500';
        });
    } else {
      // Načtení již proběhlo, ale seznam je prázdný
      emptyCell.textContent = 'No folowed users found. Click Reload to try again.';
    }
    
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  } else {
    // Vytvoříme řádky pro každého přítele
    friends.forEach(friend => {
      const row = document.createElement('tr');
      row.className = 'border-b border-gray-200 hover:bg-gray-50 transition-colors';
      
      // Buňka s avatarem
      const avatarCell = document.createElement('td');
      avatarCell.className = 'px-4 py-3 w-16';
      
      const avatarElement = document.createElement('div');
      avatarElement.className = 'w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center';
      
      // Pokud nemáme URL avataru, použijeme první písmeno jména
      if (!friend.avatar_url) {
        avatarElement.textContent = friend.friend_username.charAt(0).toUpperCase();
        avatarElement.className += ' text-gray-600 font-bold';
      } else {
        // Jinak zobrazíme obrázek
        const img = document.createElement('img');
        img.src = friend.avatar_url;
        img.alt = `${friend.friend_username} avatar`;
        img.className = 'w-full h-full rounded-full object-cover';
        
        avatarElement.appendChild(img);
      }
      
      avatarCell.appendChild(avatarElement);
      row.appendChild(avatarCell);
      
      // Buňka s uživatelským jménem
      const usernameCell = document.createElement('td');
      usernameCell.textContent = friend.friend_username;
      usernameCell.className = 'px-4 py-3 font-medium';
      row.appendChild(usernameCell);
      
      // Buňka se statusem
      const statusCell = document.createElement('td');
      statusCell.className = 'px-4 py-3';
      
      const statusElement = document.createElement('div');
      statusElement.className = 'flex items-center';
      
      // Indikátor statusu
      const statusDot = document.createElement('span');
      
      // Nastavíme barvu podle statusu
      let statusColorClass = '';
      switch (friend.online_status) {
        case 'online':
          statusColorClass = 'bg-green-500';
          break;
        case 'offline':
          statusColorClass = 'bg-gray-400';
          break;
      }
      
      statusDot.className = `inline-block w-2 h-2 rounded-full mr-2 ${statusColorClass}`;
      
      const statusText = document.createElement('span');
      statusText.textContent = friend.online_status;
      statusText.className = 'text-gray-600';
      
      statusElement.appendChild(statusDot);
      statusElement.appendChild(statusText);
      statusCell.appendChild(statusElement);
      row.appendChild(statusCell);
      
      // Buňka s akcemi
      const actionsCell = document.createElement('td');
      actionsCell.className = 'px-4 py-3';
      
      const messageButton = document.createElement('button');
      messageButton.textContent = 'Remove';
      messageButton.className = 'px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors';
      
      messageButton.addEventListener('click', () => {
        alert(`Remove user from list users you follow. ${friend.friend_username}`);
      });
      
      actionsCell.appendChild(messageButton);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
  }
  
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  container.appendChild(tableContainer);
  
  return container;
}

/**
 * Rozšíření rozhraní FriendsManager o metodu getLastFetchTime
 * Toto je pouze pro TypeScript, neovlivňuje běhovou funkcionalitu
 */
declare module './friendsData.js' {
  interface FriendsManager {
    getLastFetchTime(): number;
  }
}

/**
 * Příklad použití:
 *
 * // HTML:
 * // <div id="friends-container"></div>
 *
 * // TypeScript:
 * // import { renderFriends } from './friendsTableRenderer';
 * // 
 * // // Vykreslíme tabulku a přidáme ji do DOM
 * // const friendsTable = renderFriends();
 * // document.getElementById('friends-container').append(friendsTable);
 */