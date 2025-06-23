import {getAvatar, getUserInfo} from "../../../api/getUserInfo";
import { profileContentContainerId } from "../../renderProfileContent";
import Navigo from "navigo";

export async function renderUserProfile(userProfileContainer: HTMLElement): Promise<void> {
    if (!userProfileContainer) {
        console.error("User profile container not found");
        return;
    }
    userProfileContainer.innerHTML = ""; // Vyčistit obsah kontejneru
    // Vytvořit HTML obsah jako string
    const htmlContent = `
        <div id="userProfileContent" class="flex flex-col items-center min-w-full max-w-1/4 overflow-hidden rounded-2xl">
            <img id="avatarImage" 
                 alt="Users avatar" 
                 class="w-30 h-30 rounded-full mb-4 border-1 border-gray-500 max-w-full"
                 src="">
            
            <h2 id="userName" class="max-w-full text-xl font-semibold my-2 wrap-anywhere">
                User Name
            </h2>
            
            <p id="userEmail" class="max-w-full text-sm my-4 wrap-anywhere">
                User Email
            </p>
            
            <a data-navigo href="/settings">
                <button id="settingsButton" class="tech-button min-w-28 w-36 py-1 my-8">
                    Settings
                </button>
            </a>
        </div>
    `;

    // Nastavit HTML obsah
    userProfileContainer.innerHTML = htmlContent;

    try {
        const user = await getUserInfo();

        if (user) {
            // Získat elementy pro aktualizaci dat
            const userAvatar = document.getElementById("avatarImage") as HTMLImageElement;
            const userName = document.getElementById("userName") as HTMLElement;
            const userEmail = document.getElementById("userEmail") as HTMLElement;

            if (userAvatar) userAvatar.src = user.avatar;
            if (userName) userName.textContent = user.username;
            if (userEmail) userEmail.textContent = user.email;
        } else {
            console.log("User profile: not found");
        }
    } catch (error) {
        console.error("Error rendering user profile:", error);
    }
}