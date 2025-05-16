export function clearSessionData() : void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
}