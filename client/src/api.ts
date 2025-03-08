import { getCurrentUser } from './auth.js';

interface FriendData {
    id: number;
    name: string;
    email: string;
}

export async function getFriends(): Promise<FriendData[]> {
    const user = getCurrentUser();
    if (!user) throw new Error('Uživatel není přihlášen');
    
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
        throw new Error('Chyba při načítání dat');
    }
    
    const data = await response.json();
    console.log(data);
    
    return data.map((element: any) => ({
        id: element.id,
        name: element.name,
        email: element.email
    }));
}