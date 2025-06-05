import { api_get_user_info_by_id_url } from '../config/api_url_config';

export interface SingleUserData {
    id: number;
    username: string;
    avatar: string | null;
}

export interface SingleUserResponse {
    status: string;
    message: string;
    data: SingleUserData[];
}

export class SingleUserDataManager {
    private _response: SingleUserResponse | null = null;
    private _userData: SingleUserData | null = null;
    private _apiUrl: string = api_get_user_info_by_id_url;
    private _iD: number | null = null;

    
    private setUserData(userData: SingleUserData): void {
        this._userData = userData;
        console.log('User data set:', this._userData.id, this._userData.username, this._userData.avatar);
    }
    
    public async fetchUserDataFromServer(userId: number): Promise<void> {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                throw new Error('User is not authenticated. JWT token is missing.');
            }
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "friendDbIds": [userId]
                })
            };
            const response = await fetch(this._apiUrl, requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: SingleUserResponse = await response.json();
            console.log('Fetched user data from server:', data);
            if (data.data && data.data.length > 0) {
                this.setUserData(data.data[0]); // Beru první uživatel z pole
            } else {
                throw new Error('No user data received from server');
            }
        } catch (error) {
            console.error('Error fetching user data from server:', error);
            throw error;
        }
    }

    public getUserData(): SingleUserData | null {
        return this._userData;
    }

    public getUserId(): number | null {
        return this._userData ? this._userData.id : null;
    }

    public getUsername(): string | null {
        return this._userData ? this._userData.username : null;
    }

    public getAvatar(): string | null {
        return this._userData ? this._userData.avatar : null;
    }

    public clearUserData(): void {
        this._userData = null;
    }
}