import { login } from '../api/login'
import { register } from '../api/register'
import Navigo from 'navigo'
import { ApiErrors } from "../errors/apiErrors.js";
import { validateUsername, validatePassword, validateEmail } from "./utils/security/securityUtils"
import { login_url, home_page_url } from "../config/api_url_config";

export function renderLoginRegistration(router: Navigo): void {
    let container = document.getElementById('app');
    if (!container) {
        const container = document.createElement('div');
        container.id = 'app';
        document.body.appendChild(container);
    }
    if(!container) return;
    container.replaceChildren();
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
                        <label for="username" class="block text-gray-700 mb-1">Username</label>
                        <input type="text" id="username" placeholder="Username" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
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
                        <label for="registerUsername" class="block text-gray-700 mb-1">Username</label>
                        <input type="text" id="registerUsername" placeholder="Username"  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label for="registerEmail" class="block text-gray-700 mb-1">Email</label>
                        <input type="email" id="registerEmail" placeholder="Email"  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label for="registerPassword" class="block text-gray-700 mb-1">Password</label>
                        <input type="password" id="registerPassword" placeholder="Password" minlength="8" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                
                    <button type="submit" id="registerButton" name="login" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Register
                    </button>
                </form>
            </div>
            <div id="errorMessage" class="text-red-500 hidden text-center font-bold mt-8 uppercase"></div>
        </div>
    `;


    //funkciomalita pro zmenu mezi login a registrace fromulari
    const chooseLogButton = document.getElementById('chooseLogButton') as HTMLButtonElement;
    const chooseRegButton = document.getElementById('chooseRegButton') as HTMLButtonElement;
    const logSection = document.getElementById('logSection') as HTMLDivElement;
    const regSection = document.getElementById('regSection') as HTMLDivElement;

    let errorMessage = document.getElementById('errorMessage');


    if (!chooseLogButton || !chooseRegButton || !logSection || !regSection || !errorMessage) {
        console.error('One or more elements not found in the login/registration form');
        return;
    }
    else {
        chooseRegButton.addEventListener('click', renderRegForm);
        chooseLogButton.addEventListener('click', renderLogForm);
    }
    
    function renderRegForm(): void {
        cleanInputs();
        chooseLogButton.classList.add('opacity-50');
        chooseRegButton.classList.remove('opacity-50');
        logSection.classList.add('hidden');
        regSection.classList.remove('hidden');
    }
    function renderLogForm(): void {
        cleanInputs();
        if(window.sessionStorage.getItem('username')) {
            usernameInput.value = <string>window.sessionStorage.getItem('username');
        }
        chooseLogButton.classList.remove('opacity-50');
        chooseRegButton.classList.add('opacity-50');
        logSection.classList.remove('hidden');
        regSection.classList.add('hidden');
    }
    // Funkcionalita pro registraci a prihlasenu uzivatele
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const registerUsername = document.getElementById('registerUsername') as HTMLInputElement;
    const registerEmail = document.getElementById('registerEmail') as HTMLInputElement;
    const registerPassword = document.getElementById('registerPassword') as HTMLInputElement;

    if (!usernameInput || !passwordInput || !registerUsername || !registerEmail || !registerPassword) {
        console.error('One or more input elements not found in the login/registration form');
        return;
    }
    //prihlaseni uzivatele
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    //TODO: meli bychom nejak validovat inputy u loginu?
                    await login(usernameInput.value.trim(), passwordInput.value.trim());
                    sessionStorage.clear();
                    router.navigate(home_page_url)
                } catch (error : any) {
                    if(error instanceof ApiErrors) {
                        errorMessage.textContent = error.message;
                    }
                    else {
                        errorMessage.textContent = error.message;
                    }
                    errorMessage.classList.remove('hidden');
                }
            });
        }
    }, 0);

    // Registrace uzivatele
    setTimeout(() => {
        const registerForm = document.getElementById('registerForm');

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                errorMessage.replaceChildren();

                try {
                    if(!validateUsername(registerUsername.value.trim()) || !validatePassword(registerPassword.value.trim()) || !validateEmail(registerEmail.value.trim())) {
                        return;
                    };
                    await register(registerUsername.value.trim(), registerEmail.value.trim(), registerPassword.value.trim());
                    errorMessage.textContent = "Your registration was successful! You can now log in.";
                    errorMessage.classList.add('text-green-500');
                    errorMessage.classList.remove('hidden', 'text-red-500');
                    if (window.localStorage.getItem('username')) {
                        registerUsername.value = <string>window.localStorage.getItem('username');
                    }
                    setTimeout(() => {
                        errorMessage.replaceChildren();
                        errorMessage.classList.add('hidden');
                        renderLogForm();
                    }, 2500);
                } catch (error : any) {
                    if (error instanceof ApiErrors) {
                        errorMessage.textContent = error.message;
                        setTimeout(() => {
                            errorMessage.replaceChildren();
                            errorMessage.classList.add('hidden');
                        }, 3000);
                    }
                    else {
                        alert("Server error \n" + "Try to reload the page or contact the administrator");
                    }
                    errorMessage.classList.remove('hidden');
                }
            });
        }
    }, 0);

    function cleanInputs() : void{
            usernameInput.value = "";
            passwordInput.value = "";
            registerUsername.value = "";
            registerEmail.value = "";
            registerPassword.value = "";
    }
}

