import { login } from '../auth.js';
import { register } from '../auth.js';

export function renderLogin(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex justify-center items-center min-h-screen';
    
    container.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md min-w-[380px] absolute top-20">
            <div id="chooseLogOrReg" class="flex justify-center space-x-3 items-center my-6">
                <button id="chooseLogButton" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Log In
                    </button>
                <button id="chooseRegButton" class="opacity-50 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Register
                    </button>
            </div>
            <div id="logSection" class="">
                <h2 class="text-2xl font-bold mb-6 text-center">Log In</h2>
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label for="username" class="block text-gray-700 mb-1">Nickname</label>
                        <input type="text" id="username" placeholder="Nickname" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label for="password" class="block text-gray-700 mb-1">Password</label>
                        <input type="password" id="password" placeholder="Password" minlength="8" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    
                    <button type="submit"  id="logInButton" name="login" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Log In
                    </button>
                </form>
            </div>
            <div id="regSection" class="hidden">
                <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
                <form id="registerForm" class="space-y-4">
                    <div>
                        <label for="username" class="block text-gray-700 mb-1">Nickname</label>
                        <input type="text" id="registerUsername" placeholder="Nickname"  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label for="email" class="block text-gray-700 mb-1">Email</label>
                        <input type="email" id="registerEmail" placeholder="Email"  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label for="password" class="block text-gray-700 mb-1">Password</label>
                        <input type="password" id="registerPassword" placeholder="Password" minlength="8" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                
                    <button type="submit" id="registerButton" name="login" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Register
                    </button>
                </form>
            </div>
            <div id="errorMessage" class="text-red-500 hidden"></div>
        </div>
    `;
    
    setTimeout(() => {
        const chooseLogButton = document.getElementById('chooseLogButton') as HTMLButtonElement;
        const chooseRegButton = document.getElementById('chooseRegButton') as HTMLButtonElement;
        const logSection = document.getElementById('logSection') as HTMLDivElement;
        const regSection = document.getElementById('regSection') as HTMLDivElement;
        if (chooseRegButton && regSection && logSection && chooseLogButton) {
            chooseRegButton.addEventListener('click', () => {
                chooseLogButton.classList.add('opacity-50');
                chooseRegButton.classList.remove('opacity-50');
                logSection.classList.add('hidden');
                regSection.classList.remove('hidden');
            });
        }
        else {
            console.log("Choosing Reg form failed");
        }
    }, 0);

    setTimeout(() => {
        const chooseLogButton = document.getElementById('chooseLogButton') as HTMLButtonElement;
        const chooseRegButton = document.getElementById('chooseRegButton') as HTMLButtonElement;
        const logSection = document.getElementById('logSection') as HTMLDivElement;
        const regSection = document.getElementById('regSection') as HTMLDivElement;
        if (chooseLogButton && chooseRegButton && logSection && regSection) {
            chooseLogButton.addEventListener('click', () => {
                chooseLogButton.classList.remove('opacity-50');
                chooseRegButton.classList.add('opacity-50');
                logSection.classList.remove('hidden');
                regSection.classList.add('hidden');
            });
        }
        else {
            console.log("Choosing Log form failed");
        }
    }, 0);

    // Přidání event listeneru na login formulář
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loginForm && errorMessage) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const usernameInput = document.getElementById('username') as HTMLInputElement;
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                try {
                    await login(usernameInput.value.trim(), passwordInput.value.trim());
                    window.location.href = '/';
                } catch (error) {
                    errorMessage.textContent = error instanceof Error ? error.message : 'Přihlášení selhalo';
                    errorMessage.classList.remove('hidden');
                }
            });
        }
    }, 0);

    // Přidání event listeneru na registraci
    setTimeout(() => {
        const registerForm = document.getElementById('registerForm');
        const errorMessage = document.getElementById('errorMessage');
        
        if (registerForm && errorMessage) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
    
                const usernameInput = document.getElementById('registerUsername') as HTMLInputElement;
                const emailInput = document.getElementById('registerEmail') as HTMLInputElement; 
                const passwordInput = document.getElementById('registerPassword') as HTMLInputElement;
                
                try {
                    await register(usernameInput.value.trim(), emailInput.value.trim(), passwordInput.value.trim());
                    window.location.href = '/';
                } catch (error) {
                    errorMessage.textContent = error instanceof Error ? error.message : 'Registrace selhala';
                    errorMessage.classList.remove('hidden');
                }
            });
        }
    }, 0);

    
    
    return container;
}
