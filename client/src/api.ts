import { getCurrentUser, getApiBaseUrl } from './auth.js';

interface FriendData {
    id: number;
    status: string;
    name: string;
    avatar: string;
}

export async function getFriends(): Promise<FriendData[]> {
    const user = getCurrentUser();
    if (!user) throw new Error('Uživatel není přihlášen');
    
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        throw new Error('JWT token is missing');
    }

    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/friend/friend`, requestOptions)
        if (!response.ok) {
            throw new Error('Chyba při načítání dat');
        }
        const friends  = await response.json();
        console.log(friends.data);
        
        return friends.data.map((friend: any) => ({
            id: friend.friend_id,
            status: friend.online_status,
            name: friend.friend_username, 
            avatar: friend.avatar_url,
        }));
        
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error; // Re-throw the error to make it visible to the caller
    }
}

export async function getFriendById(id: number): Promise<FriendData | null> {
    try {
        const friends = await getFriends();
        return friends.find(friend => friend.id === id) || null;
    } catch (error) {
        console.error('Error fetching friend by ID:', error);
        throw error;
    }
}