import Navigo from 'navigo';
import { renderUserProfile } from './utils/profileUtils/profileUtils';
import { handleProfileBasicFunctionality } from './utils/profileUtils/profileFunctionality';


export function renderProfileContent(parentElement: HTMLElement, router: Navigo): void {
    const profile = document.createElement('div') as HTMLDivElement;
    profile.id = 'wholeProfilePageContent';
    profile.className = "w-full min-h-max flex flex-col items-center mt-24 mb-auto";
    profile.innerHTML = `
    <div id="profilePageContainer" class="w-full rounded-lg flex flex-col lg:flex-row justify-center lg:justify-start">

        <!-- User profile -->
        <div id="userProfile" class="flex lg:pt-12 items-start w-full lg:w-1/5 min-w-[480px] lg:min-w-[240px] justify-center p-4 lg:border-r border-black/20">
            
        </div>

        <!-- Profile content -->
        <div id="profileContentContainer" class="flex flex-col w-full lg:w-4/5 min-w-[500px] p-4 lg:pl-8">

            <!-- Navigation headers -->
            <div class="mt-8 lg:mt-0 border-t-1 border-gray-200 lg:border-t-0 grid grid-cols-4 items-center h-12 divide-x divide-gray-300">
                <div id="dashboardHeader" class="flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100  font-semibold hover:font-bold border-gray-300">
                    <p>dashboard</p>
                </div>
                <div id="matchHistoryHeader" class="flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 font-semibold hover:font-bold border-b-1 border-gray-300 bg-gray-200">
                    <p>match history</p>
                </div> 
                <div id="followHeader" class="flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 font-semibold hover:font-bold border-b-1 border-gray-300 bg-gray-200">
                    <p>follow</p>
                </div>
                <div id="searchHeader" class="flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100  font-semibold hover:font-bold border-b-1 border-gray-300 bg-gray-200">
                    <p>search</p>
                </div>
            </div>

            <!-- Content section -->
            <div id="contentForProfileOptions" class="flex mt-4">
                <!-- Výstup renderDashBoardContent() -->
               
            </div>

        </div>

    </div>
    `;
    parentElement.append(profile);
    try {

        
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.innerHTML = '';
            renderUserProfile(userProfile);
        } else {
            console.error('User profile element not found');
        };
        handleProfileBasicFunctionality(router);
    }
    catch (error) {
        console.error('Error rendering profile content:', error);
    }


};

export const wholeProfilePageContentId = 'wholeProfilePageContent';
export const userProfileId = 'userProfile';
export const profilePageContainerId = 'profilePageContainer';
export const profileContentContainerId = 'profileContentContainer';
export const dashboardHeaderId = 'dashboardHeader';
export const matchHistoryHeaderId = 'matchHistoryHeader';
export const followHeaderId = 'followHeader';
export const searchHeaderId = 'searchHeader';
export const contentForProfileOptionsId = 'contentForProfileOptions';
