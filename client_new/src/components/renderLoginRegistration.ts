import { login } from '../api/login'
import { register } from '../api/register'
import Navigo from 'navigo'
import { ApiErrors } from "../errors/apiErrors.js";
import { validateUsername, validatePassword, validateEmail } from "./utils/security/securityUtils"
import {login_url, home_page_url, api_verify_mfa_url, api_reset_password_url} from "../config/api_url_config";
import { PresenceService} from "../api/presenceService";
import {refreshTokenRegular} from "./utils/refreshToken/refreshToken";


export function renderLoginRegistration(router: Navigo): void {
    let container = document.getElementById('app');
    if (!container) {
        const container = document.createElement('div');
        container.id = 'app';
        document.body.append(container);
    }
    if(!container) return;
    container.replaceChildren();
    container.className = 'flex justify-center items-center min-h-screen';
    
    container.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md min-w-[380px] absolute top-20">
            <div id="chooseLogOrReg" class="flex justify-center space-x-3 items-center my-6">
                <button id="chooseLogButton" class="tech-button w-full py-2 px-4">
                        Log In
                    </button>
                <button id="chooseRegButton" class="tech-button opacity-50 w-full py-2 px-4">
                        Register
                    </button>
            </div>
            <div id="logSection" class="">
                <h2 class="text-2xl font-bold mb-6 text-center">Log In</h2>
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label for="username" class="block text-gray-700 mb-1">Username</label>
                        <input type="text" id="username" placeholder="Username" class="w-full p-2 border hover:border-gray-400 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                    </div>
                    <div>
                        <label for="password" class="block text-gray-700 mb-1">Password</label>
                        <input type="password" id="password" placeholder="Password" minlength="8" class="w-full p-2 border border-gray-300 hover:border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                    </div>
                    <div class="text-right">
                        <a href="#" id="forgotPasswordLink" class="text-blue-600 hover:underline text-sm">Forgot Password?</a>
                    </div>
                    <button type="submit"  id="logInButton" name="login" class="w-full yes-button font-bold py-2 px-4">
                        Log In
                    </button>
                </form>
            </div>
            <div id="regSection" class="hidden">
                <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
                <form id="registerForm" class="space-y-4">
                    <div>
                        <label for="registerUsername" class="block text-gray-700 mb-1">Username</label>
                        <input type="text" id="registerUsername" placeholder="Username"  class="w-full p-2 border border-gray-300 hover:border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                    </div>
                    <div>
                        <label for="registerEmail" class="block text-gray-700 mb-1">Email</label>
                        <input type="email" id="registerEmail" placeholder="Email"  class="w-full p-2 border border-gray-300 hover:border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                    </div>
                    <div>
                        <label for="registerPassword" class="block text-gray-700 mb-1">Password</label>
                        <input type="password" id="registerPassword" placeholder="Password" minlength="8" class="w-full p-2 border border-gray-300 hover:border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                    </div>
                    <div>
                        <label for="confirmPassword" class="block text-gray-700 mb-1">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm Password" minlength="8" class="w-full p-2 border border-gray-300 hover:border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                    </div>
                    <button type="submit" id="registerButton" name="login" class="w-full yes-button font-bold py-2 px-4 ">
                        Register
                    </button>
                </form>
            </div>
            <div id="errorMessage" class="text-red-500 hidden text-center font-bold mt-8 uppercase"></div>
            <div id="mfaModal" class="hidden fixed inset-0 bg-gray-100 flex justify-center items-center">
                <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 class="text-2xl font-bold mb-4 text-center">Two-Factor Authentication</h2>
                    <p id="mfaMessage" class="text-gray-700 mb-4 text-center"></p>
                    <form id="mfaForm" class="space-y-4">
                        <div>
                            <label for="mfaCode" class="block text-gray-700 mb-1">One-Time Password</label>
                            <input type="text" id="mfaCode" placeholder="Enter OTP" class="w-full p-2 border border-gray-300 hover:border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                        </div>
                        <button type="submit" id="mfaSubmitButton" class="w-full font-bold py-2 px-4 yes-button">
                            Verify
                        </button>
                    </form>
                    <div id="mfaErrorMessage" class="text-red-500 hidden text-center font-bold mt-4"></div>
                </div>
            </div>
             <div id="forgotPasswordModal" class="hidden fixed inset-0 bg-gray-100 flex justify-center items-center">
                <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 class="text-2xl font-bold mb-4 text-center">Reset Password</h2>
                    <form id="forgotPasswordForm" class="space-y-4">
                        <div>
                            <label for="forgotUsername" class="block mb-1 text-gray-700">Username</label>
                            <input type="text" id="forgotUsername" placeholder="Enter your username" class="w-full p-2 border rounded border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500" required>
                        </div>
                        <div>
                            <label for="forgotEmail" class="block mb-1 text-gray-700">Email</label>
                            <input type="email" id="forgotEmail" placeholder="Enter your email" class="w-full p-2 border rounded border-gray-300 focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-gray-500" required>
                        </div>
                        <div class="flex justify-center space-x-3 items-center my-6">
                            <button type="button" id="cancelForgotPassword" class="w-1/2 font-bold py-2 px-4 no-button" onclick="document.getElementById('forgotPasswordModal').classList.add('hidden')">Cancel</button>
                            <button type="submit" id="forgotPasswordSubmit" class="w-1/2 font-bold py-2 px-4 yes-button">Reset</button>
                        </div>
                    </form>
                    <div id="forgotPasswordMessage" class="text-green-500 hidden text-center font-bold mt-4"></div>
                    <div id="forgotPasswordErrorMessage" class="text-red-500 hidden text-center font-bold mt-4"></div>
                </div>
            </div>
        </div>
    `;


    //funkciomalita pro zmenu mezi login a registrace fromulari
    const chooseLogButton = document.getElementById('chooseLogButton') as HTMLButtonElement;
    const chooseRegButton = document.getElementById('chooseRegButton') as HTMLButtonElement;
    const logSection = document.getElementById('logSection') as HTMLDivElement;
    const regSection = document.getElementById('regSection') as HTMLDivElement;
    let errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    const mfaModal = document.getElementById('mfaModal') as HTMLDivElement;
    const mfaMessage = document.getElementById('mfaMessage') as HTMLParagraphElement;
    const mfaErrorMessage = document.getElementById('mfaErrorMessage') as HTMLDivElement;
    const forgotPasswordLink = document.getElementById('forgotPasswordLink') as HTMLAnchorElement;
    const forgotPasswordModal = document.getElementById('forgotPasswordModal') as HTMLDivElement;
    const forgotPasswordMessage = document.getElementById('forgotPasswordMessage') as HTMLDivElement;
    const forgotPasswordErrorMessage = document.getElementById('forgotPasswordErrorMessage') as HTMLDivElement;


    if (!chooseLogButton || !chooseRegButton || !logSection || !regSection || !errorMessage || !mfaModal || !mfaMessage || !mfaErrorMessage || !forgotPasswordLink || !forgotPasswordModal || !forgotPasswordMessage || !forgotPasswordErrorMessage) {
        console.error('One or more elements not found in the login/registration form');
        return;
    } else {
        chooseRegButton.addEventListener('click', renderRegForm);
        chooseLogButton.addEventListener('click', renderLogForm);
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.classList.remove('hidden');
            forgotPasswordMessage.classList.add('hidden');
            forgotPasswordErrorMessage.classList.add('hidden');
        });
    }

    function renderRegForm(): void {
        cleanInputs();
        chooseLogButton.classList.add('opacity-50');
        chooseRegButton.classList.remove('opacity-50');
        logSection.classList.add('hidden');
        regSection.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        mfaModal.classList.add('hidden');
        forgotPasswordModal.classList.add('hidden');
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
        forgotPasswordModal.classList.add('hidden');
    }
    // Funkcionalita pro registraci a prihlasenu uzivatele
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const registerUsername = document.getElementById('registerUsername') as HTMLInputElement;
    const registerEmail = document.getElementById('registerEmail') as HTMLInputElement;
    const registerPassword = document.getElementById('registerPassword') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    const mfaCodeInput = document.getElementById('mfaCode') as HTMLInputElement;
    const forgotUsernameInput = document.getElementById('forgotUsername') as HTMLInputElement;
    const forgotEmailInput = document.getElementById('forgotEmail') as HTMLInputElement;


    if (!usernameInput || !passwordInput || !registerUsername || !registerEmail || !registerPassword || !confirmPassword || !mfaCodeInput || !forgotUsernameInput || !forgotEmailInput) {
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
                    const data = await login(usernameInput.value.trim(), passwordInput.value.trim());
                    if (data.mfa === false) {
                        sessionStorage.clear();
                        const storedJwt = localStorage.getItem('jwt');
                        const presenceService = PresenceService.getInstance();
                        if (storedJwt) {
                            presenceService.onLogin(storedJwt);
                        }
                        router.navigate(home_page_url)
                    }
                    else if (data.mfa === true) {
                        mfaMessage.textContent = data.message || 'Please enter the one-time password sent to your email.';
                        mfaModal.classList.remove('hidden');
                        mfaErrorMessage.classList.add('hidden');
                        mfaCodeInput.value = '';
                    }
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

    // MFA verification
    setTimeout(() => {
        const mfaForm = document.getElementById('mfaForm');
        if (mfaForm) {
            mfaForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const mfaCode = mfaCodeInput.value.trim();
                    if (!mfaCode) {
                        mfaErrorMessage.textContent = 'Please enter the one-time password.';
                        mfaErrorMessage.classList.remove('hidden');
                        return;
                    }
                    await verifyMfa(mfaCode);
                    sessionStorage.clear();
                    const storedJwt = localStorage.getItem('jwt');
                    const presenceService = PresenceService.getInstance();
                    if (storedJwt) {
                        presenceService.onLogin(storedJwt);
                    }
                    router.navigate(home_page_url);
                } catch (error: any) {
                    mfaErrorMessage.textContent = error instanceof ApiErrors ? error.message : 'Invalid one-time password. Please try again.';
                    mfaErrorMessage.classList.remove('hidden');
                }
            });
        }
    }, 0);


    // Forgot Password functionality
    setTimeout(() => {
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const username = forgotUsernameInput.value.trim();
                    const email = forgotEmailInput.value.trim();
                    if (!validateUsername(username)) {
                        forgotPasswordErrorMessage.textContent = 'Please enter a valid username.';
                        forgotPasswordErrorMessage.classList.remove('hidden');
                        return;
                    }
                    if (!validateEmail(email)) {
                        forgotPasswordErrorMessage.textContent = 'Please enter a valid email address.';
                        forgotPasswordErrorMessage.classList.remove('hidden');
                        return;
                    }

                    const response = await fetch(api_reset_password_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, username })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new ApiErrors(response.status, error.message || 'Failed to send reset link');
                    }

                    const responseJson = await response.json();

                    forgotPasswordMessage.textContent = 'A new password has been sent to your email.';
                    forgotPasswordMessage.classList.remove('hidden');
                    forgotPasswordErrorMessage.classList.add('hidden');
                    forgotUsernameInput.value = '';
                    forgotEmailInput.value = '';
                    setTimeout(() => {
                        forgotPasswordModal.classList.add('hidden');
                        forgotPasswordMessage.classList.add('hidden');
                    }, 3000);
                } catch (error: any) {
                    console.error(error);
                    // forgotPasswordErrorMessage.textContent = error instanceof ApiErrors ? error.message : 'An error occurred. Please try again later or contact administrator.';
                    forgotPasswordErrorMessage.textContent = 'An error occurred. Please try again later or contact administrator.';
                    forgotPasswordErrorMessage.classList.remove('hidden');
                    forgotPasswordMessage.classList.add('hidden');
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
                    const password = registerPassword.value.trim();
                    const confirmPass = confirmPassword.value.trim();

                    if (password !== confirmPass) {
                        errorMessage.textContent = "Passwords do not match";
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => {
                            errorMessage.replaceChildren();
                            errorMessage.classList.add('hidden');
                        }, 3000);
                        return;
                    }

                    if(!validateUsername(registerUsername.value.trim())) {
                        errorMessage.textContent = 'Please enter a valid username. Size should be between 3 and 10 characters.';
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => {
                            errorMessage.replaceChildren();
                            errorMessage.classList.add('hidden');
                        }, 3000);
                        return;
                    }
                    if (!validatePassword(registerPassword.value.trim())) {
                        errorMessage.textContent = 'Please enter a valid password.';
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => {
                            errorMessage.replaceChildren();
                            errorMessage.classList.add('hidden');
                        }, 3000);
                        return;
                    }
                    if (!validateEmail(registerEmail.value.trim())) {
                        errorMessage.textContent = 'Please enter a valid email address.';
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => {
                            errorMessage.replaceChildren();
                            errorMessage.classList.add('hidden');
                        }, 3000);
                        return;
                    }
                    await register(registerUsername.value.trim(), registerEmail.value.trim(), registerPassword.value.trim());
                    errorMessage.textContent = "Your registration was successful! You can now log in.";
                    errorMessage.classList.add('text-green-500');
                    errorMessage.classList.remove('hidden', 'text-red-500');
                    if (window.localStorage.getItem('username')) {
                        registerUsername.value = <string>window.localStorage.getItem('username');
                    }
                    setTimeout(() => {
                        errorMessage.replaceChildren();
                        errorMessage.classList.add('hidden', 'text-red-500');
                        errorMessage.classList.remove('text-green-500');
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
            confirmPassword.value = "";
            mfaCodeInput.value = "";
            forgotEmailInput.value = "";
    }
}

export async function verifyMfa(code: string): Promise<void> {
    const response = await fetch(api_verify_mfa_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('mfa_jwt')}`
        },
        body: JSON.stringify({ mfa: code })
    });
    if (!response.ok) {
        // const error = await response.json();
        throw new ApiErrors(response.status, 'MFA verification failed');
    }
    const { message, data } = await response.json();
    if (response.ok) {
        window.localStorage.setItem("jwt", data.token);
        refreshTokenRegular();
    }
}