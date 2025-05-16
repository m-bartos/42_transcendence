import { login } from '../api/login'
import { register } from '../api/register'
import Navigo from 'navigo'
import { ApiErrors } from "../errors/apiErrors.js";
import { login_url, home_page_url } from "../config/api_url_config";

export function renderLoginRegistration(router: Navigo): void {
    let container = document.getElementById('app');
    if (!container) {
        container = document.createElement('app');
    }
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
                        <label for="username" class="block text-gray-700 mb-1">Username</label>
                        <input type="text" id="registerUsername" placeholder="Username"  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
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
            <div id="errorMessage" class="text-red-500 hidden text-center font-bold mt-8 uppercase"></div>
        </div>
    `;
    
    setTimeout(() => {
        const chooseLogButton = document.getElementById('chooseLogButton') as HTMLButtonElement;
        const chooseRegButton = document.getElementById('chooseRegButton') as HTMLButtonElement;
        const logSection = document.getElementById('logSection') as HTMLDivElement;
        const regSection = document.getElementById('regSection') as HTMLDivElement;
        if (chooseRegButton && regSection && logSection && chooseLogButton) {
            chooseRegButton.addEventListener('click', () => {
                cleanInputs();
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
                cleanInputs();
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
    // Todo: Add user input validation
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        let errorMessage = document.getElementById('errorMessage');
        if(errorMessage){
            errorMessage.replaceChildren();
        }
        if (window.localStorage.getItem('username')) {
            let usernameInput = document.getElementById('username') as HTMLInputElement;
            if (usernameInput) {
                usernameInput.value = <string>window.localStorage.getItem('username');
            }
        }
        if (loginForm && errorMessage) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const usernameInput = document.getElementById('username') as HTMLInputElement;
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                try {
                    await login(usernameInput.value.trim(), passwordInput.value.trim());
                    localStorage.setItem('username', usernameInput.value.trim());
                    router.navigate(home_page_url)

                } catch (error : any) {
                    if(error instanceof ApiErrors) {
                        errorMessage.textContent = error.message;
                    }
                    else {
                        errorMessage.textContent = error.message;
                    }
                    errorMessage.classList.remove('hidden');
                    setTimeout(() => {
                        errorMessage.replaceChildren();
                        errorMessage.classList.add('hidden');
                    }
                    , 2500);
                }
            });
        }
    }, 0);

    // // Přidání event listeneru na registraci
    setTimeout(() => {
        const registerForm = document.getElementById('registerForm');
        let errorMessage = document.getElementById('errorMessage');

        if (registerForm && errorMessage) {
            errorMessage.replaceChildren();
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const usernameInput = document.getElementById('registerUsername') as HTMLInputElement;
                const emailInput = document.getElementById('registerEmail') as HTMLInputElement;
                const passwordInput = document.getElementById('registerPassword') as HTMLInputElement;

                try {
                    await register(usernameInput.value.trim(), emailInput.value.trim(), passwordInput.value.trim());
                    errorMessage.textContent = "Vaše registrace proběhla úspěšně. Nyni se muzete prihlasit";
                    errorMessage.classList.add('text-green-500');
                    errorMessage.classList.remove('hidden', 'text-red-500');
                    if (window.localStorage.getItem('username')) {
                        usernameInput.value = <string>window.localStorage.getItem('username');
                    }
                    // setTimeout(() => {
                    //     window.location.href = '/';
                    // }, 1500);
                    router.navigate(login_url)
                } catch (error : any) {
                    if (error instanceof ApiErrors) {
                        errorMessage.textContent = error.message;
                    }
                    else {
                        alert("Server error \n" + "Try to reload the page or contact the administrator");
                    }
                    errorMessage.classList.remove('hidden');
                    setTimeout(() => {
                        errorMessage.replaceChildren();
                        errorMessage.classList.add('hidden');
                    }, 2500);
                }
            });
        }
    }, 0);

    function cleanInputs() : void{
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const registerUsername = document.getElementById('registerUsername') as HTMLInputElement;
        const registerEmail = document.getElementById('registerEmail') as HTMLInputElement;
        const registerPassword = document.getElementById('registerPassword') as HTMLInputElement;
        if(usernameInput && passwordInput && registerUsername && registerEmail && registerPassword){
            usernameInput.value = "";
            passwordInput.value = "";
            registerUsername.value = "";
            registerEmail.value = "";
            registerPassword.value = "";
        }
        else {
            console.log("cleanInputs failed");
        }
    }
}

