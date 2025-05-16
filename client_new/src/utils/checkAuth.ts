export function checkAuth(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    const { exp: expiry } = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return now <= expiry;
}
