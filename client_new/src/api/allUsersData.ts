// import { base_url } from "../config/api_url_config";
// import { api_get_user_info_by_id_url } from '../config/api_url_config';

// export interface allUserData {
//   id: number;
//   username: string;
//   avatar: string;
// }

// export class AllUsersManager {
//     private users: allUserData[] = [];
//     private apiUrl: string;

//     constructor(apiUrl: string) {
//         this.apiUrl = apiUrl || api_get_user_info_by_id_url;
//     }

//     // Getter pro získání všech uživatelů
//     public getUsers(): allUserData[] {
//         return [...this.users]; // Vrací kopii pro zachování enkapsulace
//     }

//     // Setter pro nastavení uživatelů
//     private setUsers(users: allUserData[]): void {
//         this.users = [...users]; // Vytvoří kopii pro zachování enkapsulace
//     }

//     // Funkce pro fetch dat ze serveru
//     public async fetchUsersFromServer(userIds: number[]): Promise<void> {
//         try {
//             const token = localStorage.getItem('jwt');
//             if (!token) {
//                 throw new Error('User is not authenticated. JWT token is missing.');
//                 // Pokud není token, nemůžeme pokračovat TODO: přesměrovat na přihlášení nebo zobrazit chybovou hlášku
//             }
//             const requestOptions = {
//                 method: 'POST',
//                 headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
//                 'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                 "friendDbIds": [userIds]
//                 })
//             };
//             const response = await fetch(this.apiUrl, requestOptions);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
            
//             const userData: allUserData[] = await response.json();
//             this.setUsers(userData);
//             } catch (error) {
//                 console.error('Chyba při načítání uživatelů ze serveru:', error);
//                 throw error;
//         }
//     }

//     // Funkce pro vrácení uživatele podle ID
//     public getUserById(id: number): allUserData | undefined {
//         return this.users.find(user => user.id === id);
//     }

//     // Funkce pro vrácení uživatele podle username
//     public getUserByUsername(username: string): allUserData | undefined {
//         return this.users.find(user => user.username === username);
//     }

//     public getUsersCount(): number {
//         return this.users.length;
//     }
//     public clearUsers(): void {
//         this.users = [];
//     }
// }