import Navigo from "navigo";
import { AuthManager, UserData } from "../api/user";
import { profileContentContainerId } from "./renderProfileContent";
import { renderNav } from "./renderNavigation";
import { renderFooter } from "./renderFooter";
import { renderProfileContent } from "./renderProfileContent";
import { handleMenu } from "./utils/navigation/naviUtils";
import { logoutFromAllSessions } from "../api/login";
import { cleanDataAndReload } from "./utils/security/securityUtils";
import { renderUserProfile } from "./utils/profileUtils/profileUtils";
import { getUserInfoFromServer } from "../api/getUserInfo";
import { showToast } from "./utils/loginRegistration/showToast";
import { api_update_user_url, api_update_user_password_url, api_delete_user_url, base_url, api_upload_user_avatar_url } from "../config/api_url_config";


export function renderSettings(router: Navigo): void {

    document.title = "Pong - Settings";
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    //app.className = "w-full md:container flex flex-col mx-auto min-h-dvh md:p-4"
    try {
        //do hlavni stranky pridame navigaci
        renderNav(app);
        //take obsah hlavni stranky
        renderProfileContent(app, router);
        ///a na konec footer
        renderFooter(app);
        //zde je potreba pridat event listener na logout a ostatni menu funkce a listenery
        handleMenu();
    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }

    const settingsPage = document.getElementById(profileContentContainerId);
    if (!settingsPage) {
        console.error("Settings page container not found");
        return;
    }
    const user: UserData | null = AuthManager.getUser();
    settingsPage.innerHTML = `
        <div id="settingsPageContainer" class="w-8/10 flex flex-col items-center pt-8 lg:pt-0 mx-auto border-t-1 lg:border-t-0 border-gray-300">
            <!-- Hlavička -->
            <div class="w-full px-6 py-4 rounded-lg border border-gray-500 mb-6">
                <h2 class="text-xl font-semibold tracking-[1rem] text-center">Profile settings</h2>
            </div>

            <!-- Formulář -->
            <form id="settingsForm" class="space-y-8 w-full">
                <!-- Avatar sekce -->
                <div class="space-y-4 text-center">
                    <h3 class="text-lg font-medium text-gray-700">AVATAR</h3>
                    <div class="flex items-center justify-around space-x-4">
                        <div class="w-24 h-24 border border-gray-400 rounded-full bg-gray-200/80 flex items-center justify-center overflow-hidden">
                            <img id="avatarPreview" class="w-full h-full object-cover" 
                                 src="${user?.avatar || `${base_url}/src/assets/images/defaultAvatar.png`}" 
                                 alt="profile picture"
                                 onerror="this.src='${base_url}/src/assets/images/defaultAvatar.png'">
                        </div>
                        <div class="flex flex-col">
                            <label for="avatarInput" class="tech-button px-4 py-2">
                                Choose image
                            </label>
                            <input type="file" id="avatarInput" accept="image/*" class="hidden">
                            <p class="text-sm text-gray-500 mt-1">Max. size: 500 kB</p>
                        </div>
                    </div>
                </div>

                <hr class="border-gray-200">

                <!-- Uživatelské údaje -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-700 text-center">USER INFORMATION CHANGE</h3>
                    
                    <!-- Uživatelské jméno -->
                    <div class="space-y-1">
                        <label for="usernameInput" class="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" id="usernameInput" 
                               placeholder="Username - at least 4 characters" 
                               minlength="4"
                               class="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white">
                    </div>

                    <!-- Email -->
                    <div class="space-y-1">
                        <label for="emailInput" class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="emailInput" 
                               placeholder="Email"
                               class="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white">
                    </div>
                </div>

                <hr class="border-gray-200">

                <!-- Změna hesla -->
                <div class="space-y-4">
                    <h3 class="text-lg text-center font-medium text-gray-700 whitespace-pre-line">PASSWORD CHANGE</h3>
                    
                    <!-- Původní heslo -->
                    <div class="space-y-1 group relative">
                        <div class="absolute border-1 border-red-800 -top-15 left-70 bg-gray-100 text-base text-sm rounded-md p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-w-[300px] z-100">
                            After changing the password you will be logged out and need to log in again.
                        </div>
                        <label for="oldPasswordInput" class="block text-sm font-medium text-gray-700">Current password</label>
                        <input type="password" id="oldPasswordInput" 
                               class="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white">
                    </div>

                    <!-- Nové heslo -->
                    <div class="space-y-1">
                        <label for="newPasswordInput" class="block text-sm font-medium text-gray-700">New password</label>
                        <input type="password" id="newPasswordInput" 
                               class="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white">
                    </div>

                    <!-- Potvrzení nového hesla -->
                    <div class="space-y-1">
                        <label for="confirmPasswordInput" class="block text-sm font-medium text-gray-700">Confirm new password</label>
                        <input type="password" id="confirmPasswordInput" 
                               class="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white">
                    </div>
                </div>

                <!-- Hlavní tlačítka -->
                <div class="bg-gray-50/50 px-6 py-4 flex justify-around rounded-md">
                    <button type="button" id="cancelButton" 
                            class="no-button px-8 py-1 lg:px-16 lg:py-2 lg:font-semibold">
                        Cancel
                    </button>
                    <button type="button" id="confirmButton" 
                            class="yes-button px-8 py-1 lg:px-16 lg:py-2 lg:font-semibold">
                        Confirm
                    </button>
                </div>

                <!-- Účet tlačítka -->
                <div class="bg-gray-500 px-6 py-4 flex flex-col lg:flex-row justify-around rounded-md border-t border-gray-600">
                    <button type="button" id="logOutAllSessionsButton" 
                            class="lg:font-semibold px-4 py-2 border border-red-800 rounded-md text-gray-700 bg-gray-50 hover:bg-red-800 hover:text-gray-200 hover:border-white cursor-pointer transition-all duration-150 ease-in-out my-2 lg:my-0">
                        Log Out From All Sessions
                    </button>
                    <button type="button" id="deleteUserButton" 
                            class="lg:font-semibold px-4 py-2 border border-red-800 rounded-md text-gray-700 bg-gray-50 hover:bg-red-800 hover:text-gray-200 hover:border-white cursor-pointer transition-all duration-150 ease-in-out my-2 lg:my-0">
                        Delete Account
                    </button>
                </div>
            </form>
        
        </div>
    `;
    console.log("Settings page rendered successfullyyy");
    initializeSettingsPage();
};

// Definice typů pro formulářová data
interface SettingsFormData {
    avatar: File | null;
    username: string;
    email: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Definice typů pro API response
interface ApiResponse {
    success: boolean;
    message: string;
}



// Inicializace funkcionalit stránky nastavení

function initializeSettingsPage(): void {
    console.log("Initializing settings page...");
    // Stav formuláře
    const formData: SettingsFormData = {
        avatar: null,
        username: '',
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    // Proměnná pro sledování změn v jednotlivých částech
    const formChanged = {
        avatar: false,
        profile: false,
        password: false
    };

    // Získání elementů
    const avatarInput = document.getElementById('avatarInput') as HTMLInputElement;
    const avatarPreview = document.getElementById('avatarPreview') as HTMLImageElement;
    const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
    const emailInput = document.getElementById('emailInput') as HTMLInputElement;
    const oldPasswordInput = document.getElementById('oldPasswordInput') as HTMLInputElement;
    const newPasswordInput = document.getElementById('newPasswordInput') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPasswordInput') as HTMLInputElement;
    const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;
    const confirmButton = document.getElementById('confirmButton') as HTMLButtonElement;
    const logOutAllSessionsButton = document.getElementById('logOutAllSessionsButton') as HTMLButtonElement;
    const deleteUserButton = document.getElementById('deleteUserButton') as HTMLButtonElement;

    // Event listener pro nahrání avataru
    avatarInput.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        
        if (target.files && target.files.length > 0) {
            const file = target.files[0];
            
            // Kontrola velikosti souboru (500kB = 512000 bajtů)
            if (file.size > 512000) {
                showToast('Maximum file size is 500 kB.', 'error');
                target.value = '';
                return;
            }
            
            // Kontrola, zda se jedná o obrázek
            if (!file.type.startsWith('image/')) {
                showToast('The uploaded file is not an image.', 'error');
                target.value = '';
                return;
            }
            
            // Nastavení náhledu
            avatarPreview.src = URL.createObjectURL(file);
            formData.avatar = file;
            formChanged.avatar = true;
        }
    });

    // Event listenery pro sledování změn v profileSection
    usernameInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        formData.username = target.value;
        formChanged.profile = true;
    });

    emailInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        formData.email = target.value;
        formChanged.profile = true;
    });

    // Event listenery pro sledování změn v passwordSection
    oldPasswordInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        formData.oldPassword = target.value.trim();
        formChanged.password = true;
    });

    newPasswordInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        formData.newPassword = target.value.trim();
        formChanged.password = true;
    });

    confirmPasswordInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        formData.confirmPassword = target.value.trim();
        formChanged.password = true;
    });

    // Event listenery pro tlačítka
    cancelButton.addEventListener('click', () => {
        window.history.back();
    });

    confirmButton.addEventListener('click', (e) => {
        e.preventDefault();
        submitForm(formData, formChanged);
    });

    logOutAllSessionsButton.addEventListener('click', logoutFromAllSessions);

    deleteUserButton.addEventListener('click', async () => {
        const result = confirm('Are you sure you want to delete your account?');
        if (result) {
            try {
                const response = await fetch(api_delete_user_url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                    }
                }); 
                const data = await response.json();

                window.alert(`deleting user: ${data.message}`);
                if (!response.ok) {
                    showToast(`Error deleting the account: ${data.message}`, 'error');
                    return;
                }
                else {
                    cleanDataAndReload();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                showToast('An unexpected error occurred while deleting the account.', 'error');
            }
        }
    });
}


//Validace vstupu

function validateInput(formData: SettingsFormData, formChanged: any): boolean {
    // Kontrola uživatelského jména
    if (formChanged.profile && formData.username) {
        // Povolené znaky: písmena, čísla, podtržítko a pomlčka
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(formData.username)) {
            showToast('The username contains illegal characters. Letters, numbers, underscores, and hyphens are allowed.', 'error');
            return false;
        }
        if(formData.username.length < 4){
            showToast('Username needs to be at least 4 characters long.', 'error');
            return false;
        } 
    }
    
    // Kontrola emailu
    if (formChanged.profile && formData.email) {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(formData.email)) {
            showToast('Invalid email format.', 'error');
            return false;
        }
    }
    
    // Kontrola hesel
    if (formChanged.password) {
        // Kontrola, zda bylo zadáno původní heslo
        if (!formData.oldPassword) {
            showToast('Enter your current password.', 'error');
            return false;
        }
        
        // Kontrola, zda byla zadána obě nová hesla
        if (!formData.newPassword || !formData.confirmPassword) {
            showToast('Enter a new password and confirm it.', 'error');
            return false;
        }
        
        // Kontrola, zda se nová hesla shodují
        if (formData.newPassword !== formData.confirmPassword) {
            showToast('The new passwords do not match.', 'error');
            return false;
        }
        
        // Kontrola složitosti hesla
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            showToast('The password must be at least 8 characters long and contain at least one character and one number.', 'error');
            return false;
        }
    }
    
    return true;
}


// Odeslání formuláře

async function submitForm(formData: SettingsFormData, formChanged: any): Promise<void> {
    if (!validateInput(formData, formChanged)) {
        return;
    }
    const userProfileContainer = document.getElementById('userProfile');
    if(!userProfileContainer) {
        console.error("User profile container not found");  
        throw new Error("User profile container not found");
    }
    try {
        // Kontrola, zda byly provedeny nějaké změny
        if (!formChanged.avatar && !formChanged.profile && !formChanged.password) {
            showToast('No changes to save.', 'success');
            return;
        }
        
        // 1. Nahrání avataru
        if (formChanged.avatar && formData.avatar) {
            const formDataAvatar = new FormData();

            formDataAvatar.append('upload', formData.avatar);
            const avatarResponse = await fetch(api_upload_user_avatar_url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: formDataAvatar
            });
            
            const avatarResult = await avatarResponse.json();
          
            if (avatarResult.status !== "success") {
                showToast(`Error uploading avatar: ${avatarResult.message}`, 'error');
                return;
            }
            else {
                await getUserInfoFromServer();
                renderUserProfile(userProfileContainer);
            }
        }
        
        // 2. Aktualizace uživatelských údajů
        if (formChanged.profile) {
            const requestData: { username?: string; email?: string } = {};
            if (formData.username.length > 0) {
                requestData.username = formData.username;
            }
            if (formData.email.length > 0) {
                requestData.email = formData.email;
            }
            const requestOptions = {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            };
            
            console.log(requestOptions);
            const profileResponse = await fetch(api_update_user_url, requestOptions);
         
            if(profileResponse.status === 409){
                showToast(`The username or email already exists.`, 'error');
                return;
            }
            else if (!profileResponse.ok) {
                showToast(`Error updating profile: ${profileResponse.statusText}`, 'error');
                return;
            }
            else{
                await getUserInfoFromServer();
                renderUserProfile(userProfileContainer);
            }
        }
        
        // 3. Změna hesla
        if (formChanged.password) {
            const passwordResponse = await fetch(api_update_user_password_url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "password": formData.oldPassword,
                    "newPassword": formData.newPassword
                })
            });
            const passwordResult: ApiResponse = await passwordResponse.json();

            if (!passwordResponse.ok) {
                showToast(`Error password change: ${passwordResult.message}`, 'error');
                return;
            }
            else{
                console.log(`Password change should be ok: ${passwordResult.message}`);
            }
        }
        
        // Oznámení úspěchu
        showToast('Changes saved successfully.', 'success');
        
        // Přidání logu pro sledování průběhu
        console.log('The form was successfully submitted:', {
            avatarChanged: formChanged.avatar,
            profileChanged: formChanged.profile,
            passwordChanged: formChanged.password
        });

        // Pokud byla změněna hesla, odhlásit uživatele
        if(formChanged.password){
            setTimeout(() => {
                cleanDataAndReload();
            }, 3000);
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showToast('An unexpected error occurred while saving changes.', 'error');
    }
}

