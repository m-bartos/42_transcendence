
import Navigo from 'navigo';
import { SingleUserDataManager } from '../../../api/singleUserData';
import { getAvatar } from '../../../api/getUserInfo';
import { renderDashBoardContent } from '../../renderDashboard';
import { renderGameHistory } from '../../renderHistory';

export function renderWholeUsersProfile(parentElement: HTMLElement, router: Navigo, friendId: number): void {
    
    const profile = document.createElement('div') as HTMLDivElement;
    profile.id = 'wholeUsersProfilePageContent';
    profile.className = "w-full min-h-max flex flex-col items-center mt-24 mb-auto min-w-[500px]";
    profile.innerHTML = `
    <div id="profileUsersPageContainer" class="w-full rounded-lg flex flex-col lg:flex-row justify-center lg:justify-start">

        <!-- User profile -->
        <div id="userUsersProfile" class="flex lg:pt-12 items-start w-full lg:w-1/5 lg:min-w-[240px] justify-center p-4 lg:border-r border-black/20">
            
        </div>

        <!-- Profile content -->
        <div id="profileUsersContentContainer" class="flex flex-col w-full lg:w-4/5 p-4 lg:pl-8">

            <!-- Navigation headers -->
            <div class="mt-8 lg:mt-0 border-t-1 border-gray-200 lg:border-t-0 grid grid-cols-2 items-center h-12 divide-x divide-gray-300">
                <div id="usersDashboardHeader" class="flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100  font-semibold hover:font-bold border-gray-300">
                    <p>dashboard</p>
                </div>
                <div id="usersMatchHistoryHeader" class="flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 font-semibold hover:font-bold border-b-1 border-gray-300 bg-gray-200">
                    <p>history</p>
                </div> 
            </div>

            <!-- Content section -->
            <div id="usersContentForProfileOptions" class="flex mt-4">
                <!-- Výstup renderDashBoardContent() -->
                
            </div>

        </div>

    </div>
    `;
    parentElement.append(profile);
    try {
        const usersProfile = document.getElementById('userUsersProfile');
        if (usersProfile) {
            usersProfile.innerHTML = '';
            renderUsersProfileSection(usersProfile, friendId);
        } else {
            console.error('User profile element not found');
        };
        handleUsersProfileBasicFunctionality(router, friendId);
    }
    catch (error) {
        console.error('Error rendering profile content:', error);
    }
};

const dashboardHeaderId = 'usersDashboardHeader';
const matchHistoryHeaderId = 'usersMatchHistoryHeader';
const contentForProfileOptionsId = 'usersContentForProfileOptions';

//Vykreslujeme sekci profilu uzivatele
export async function renderUsersProfileSection(parentElement: HTMLElement, friendId: number): Promise<void> {
    if (!parentElement) {
            console.error("User profile container not found");
            return;
        }
        parentElement.innerHTML = ""; // Vyčistit obsah kontejneru
        // Vytvořit HTML obsah jako string
        const htmlContent = `
            <div id="usersProfileContent${friendId}" class="flex flex-col items-center min-w-full max-w-1/4 overflow-hidden rounded-2xl">
                <img id="avatarImage${friendId}" 
                     alt="Users avatar" 
                     class="w-30 h-30 rounded-full mb-4 border-1 border-gray-500 max-w-full"
                     src="">
                
                <h2 id="userName${friendId}" class="max-w-full text-xl font-semibold my-2 wrap-anywhere">
                    UserName
                </h2>
            </div>
        `;
    
        // Nastavit HTML obsah
        parentElement.innerHTML = htmlContent;
    
        try {
            const uniqueUserProfile = new SingleUserDataManager();
            await uniqueUserProfile.fetchUserDataFromServer(friendId);
            const user = uniqueUserProfile.getUserData();
            
            if (user) {
                // Získat elementy pro aktualizaci dat
                const userAvatar = document.getElementById(`avatarImage${friendId}`) as HTMLImageElement;
                const userName = document.getElementById(`userName${friendId}`) as HTMLElement;;
    
                if (userAvatar) userAvatar.src = getAvatar(user.avatar) as string;
                if (userName) userName.textContent = user.username;
            } else {
                console.error("User profile: not found");
            }
        } catch (error) {
            console.error("Error rendering user profile:", error);
        }
};

export function handleUsersProfileBasicFunctionality(router: Navigo, id: number): void {

    const dashboardHeader = document.getElementById(dashboardHeaderId) as HTMLDivElement;
    const matchHistoryHeader = document.getElementById(matchHistoryHeaderId) as HTMLDivElement;
    const contentForOptions = document.getElementById(contentForProfileOptionsId) as HTMLDivElement;
    if(!dashboardHeader || !matchHistoryHeader || !contentForOptions) {
        console.error('One or more profile header elements not found');
        return;
    }
    contentForOptions.innerHTML = '';
    renderDashBoardContent(contentForOptions, id);
    dashboardHeader.addEventListener('click', (e) => {
        dashboardHeader.classList.remove('border-b-1', 'bg-gray-200');
        dashboardHeader.classList.add('opacity-100', 'font-bold');
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        renderDashBoardContent(contentForOptions, id);
    });
    matchHistoryHeader.addEventListener('click', (e) => {
        matchHistoryHeader.classList.remove('border-b-1', 'bg-gray-200');
        matchHistoryHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        renderGameHistory(router, contentForOptions, id);
    });
}