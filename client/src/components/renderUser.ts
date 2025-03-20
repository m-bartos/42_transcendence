import { createSettingsDialog } from "./userSettings.js";
import { fetchUserInfo } from "./userInfo.js";
import { User } from "../auth.js";

export function renderUser() : HTMLElement{
    const container = document.createElement('div');
    container.className = `flex flex-col items-center min-w-[200px] max-w-1/4 p-4 overflow-hidden rounded-2xl shadow-md shadow-gray-200 border-1 border-gray-100`;
    container.innerHTML = `
        <img id="avatarImage" alt="avatar" class="w-24 h-24 rounded-full mb-4">
        <h2 class="text-2xl font-semibold" id="username">User name</h2>
        <p id="email" class="text-gray-500">default Email</p>
        <button id="userSettingsButton" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-md">Settings</button>
    `;
    setTimeout(async () => {
        const avatar = document.getElementById('avatarImage') as HTMLImageElement;
        const username = document.getElementById('username') as HTMLElement;
        const email = document.getElementById('email');
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        console.log("user:", user);
        //const user = JSON.parse(localStorage.getItem('user')) as User;
        if (user && email && username && avatar) {

            reloadUserData();
        }
        const settingsButton = document.getElementById('userSettingsButton');
        if (settingsButton) {
            settingsButton.addEventListener('click', createSettingsDialog );
        }
        function reloadUserData()  {
            console.log("reloadUserData called");
            if (user && email && username && avatar) {
                username.textContent = user.username;
                email.textContent = user.email;
                avatar.src = user.avatar;

            }
        };
    });
    return container;
}