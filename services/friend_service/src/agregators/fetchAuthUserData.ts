import {FriendDbRecords} from "./dataAggregator.js";
const authServiceUrl = 'http://auth_service:3000/user/internal/profile';
const timer = 1000;

export async function fetchAuthServiceUserData(jwt: string, friendDbRecords: FriendDbRecords[]){
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

