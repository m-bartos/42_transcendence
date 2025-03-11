import { logout } from '../auth.js';


export function renderPage1(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bg-white p-6 rounded-lg shadow-md';
    
    container.innerHTML = `
        <div id="mainContainer" class="flex flex-row bg-white text-gray-800 p-2">
            <div id="userInfo" class="flex flex-col items-center min-w-[200px] max-w-1/4 p-4 overflow-hidden rounded-2xl shadow-md shadow-gray-200">
                <img src="../src/assets/images/defaultAvatar.png" alt="avatar" class="w-24 h-24 rounded-full mb-4">
                <h2 class="text-2xl font-semibold" id="username">User name</h2>
                <p id="email" class="text-gray-500">default Email</p>
                <button id="usersLogoutBtn" class="bg-red-500 hover:ring-2 ring-red-200 ring-inset text-white px-3 py-1 rounded cursor-pointer mt-4">Odhlásit</button>
            </div>
        </div>
    `;
    setTimeout(() => {

        const username = document.getElementById('username') as HTMLElement;
        const email = document.getElementById('email');
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        console.log("user:", user);
        //const user = JSON.parse(localStorage.getItem('user')) as User;
        if (username && email && user) {
            
            //console.log("username na page1:", localStorage.getItem('user.username'));
            username.textContent = user.username;
            email.textContent = user.email;
        }
        const logoutBtn = document.getElementById('usersLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    }, 0);
    console.log("page 1 loaded");
    return container;
}