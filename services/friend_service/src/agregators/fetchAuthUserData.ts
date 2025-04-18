import {FriendDbRecords} from "./dataAggregator.js";
import {AuthUserData} from "./dataAggregator.js";
const authServiceUrl = 'http://auth_service:3000/user/internal/profile';
const timer = 1000;

// Returns an array with user data from auth service is the form of id, username and avatar link
// Please mind that the id returned is the friend_id queried!!!
export async function fetchAuthServiceUserData(jwt: string, friendDbRecords: FriendDbRecords[]): Promise<AuthUserData[]>{
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timer); // 5 seconds timeout
    try {
        const response = await fetch(authServiceUrl, {
            signal: controller.signal,
            method: "POST",
            headers: {
                'Authorization': `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ friendDbRecords: friendDbRecords }),
        })
        clearTimeout(timeout);
        if (response.ok)
        {
            const { data } = await response.json();
            return data;
        }
        return [];
    } catch (error: any) {
        return [];
    }
}

