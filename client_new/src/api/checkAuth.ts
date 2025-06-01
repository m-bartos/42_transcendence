import { cleanDataAndReload } from "../components/utils/security/securityUtils";
import { getToken } from "./getUserInfo";

export function checkAuth(): boolean {
    const token = getToken();
    if (!token) return false;
    const { exp: expiry } = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    console.log(`Token expiry: ${expiry}`, `Current time: ${now}`, `Difference: ${expiry - now}`);
    if(expiry <= now) {
        cleanDataAndReload();
        return false;
    }
    return now <= expiry;
}
