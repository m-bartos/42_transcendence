// import { api_get_user_info_by_id_url } from '../config/api_url_config';

// export interface SingleUserData {
//     userId: number;
//     username: string;
//     avatar: string;
// };

// export class SingleUserDataManager {
//     private userData: SingleUserData | null = null;
//     private apiUrl: string;

//     constructor(apiUrl: string) {
//         this.apiUrl = apiUrl || api_get_user_info_by_id_url;
//     }

    
//     private setUserData(userData: SingleUserData): void {
//         this.userData = userData;
//     }
    
//     public async fetchUserDataFromServer(userId: number): Promise<void> {
//         try {
//             const token = localStorage.getItem('jwt');
//             if (!token) {
//                 throw new Error('User is not authenticated. JWT token is missing.');
//             }
//             const requestOptions = {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     "friendDbIds": [userId]
//                 })
//             };
//             const response = await fetch(this.apiUrl, requestOptions);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             const data: SingleUserData = await response.json();
//             this.setUserData(data);
//         } catch (error) {
//             console.error('Error fetching user data from server:', error);
//             throw error;
//         }
//     }
//     public getUserData(): SingleUserData | null {
//         return this.userData;
//     }
//     public getUserId(): number | null {
//         return this.userData ? this.userData.userId : null;
//     }
//     public getUsername(): string | null {
//         return this.userData ? this.userData.username : null;
//     }
//     public getAvatar(): string | null {
//         return this.userData ? this.userData.avatar : null;
//     }
//     public clearUserData(): void {
//         this.userData = null;
//     }
// }