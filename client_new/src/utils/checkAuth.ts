import { clearSessionData } from "./clearSessionData";

export function checkAuth(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    const { exp: expiry } = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    //console.log(`Token expiry: ${expiry}`, `Current time: ${now}`, `Difference: ${expiry - now}`);
    if(expiry <= now) {
        clearSessionData();
        return false;
    }
    return now <= expiry;
}
