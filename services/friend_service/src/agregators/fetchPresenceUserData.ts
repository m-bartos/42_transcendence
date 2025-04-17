const presenceServiceUrl = 'http://presence_service:3000/ws'
const timer = 1000;

export async function fetchOnlineUserStatuses(jwt: string){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timer); // 5 seconds timeout
    try {
        const response = await fetch(presenceServiceUrl, {
            signal: controller.signal,
            method: "GET",
            headers: {
                'Authorization': `Bearer ${jwt}`,
                "Content-Type": "application/json",
            }
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

