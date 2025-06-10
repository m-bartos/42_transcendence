import Navigo from 'navigo';
import { wholeProfilePageContentId, userProfileId, profilePageContainerId, profileContentContainerId, dashboardHeaderId, matchHistoryHeaderId, followHeaderId, searchHeaderId, contentForProfileOptionsId } from '../../renderProfileContent';
import { renderFriends } from '../../renderFriends';
import { renderGameHistory } from '../../renderHistory';
import { renderDashBoardContent } from '../../renderDashboard';
import { renderSearch } from '../../renderSearch';

export function handleProfileBasicFunctionality(router: Navigo): void {
    const dashboardHeader = document.getElementById(dashboardHeaderId) as HTMLDivElement;
    const matchHistoryHeader = document.getElementById(matchHistoryHeaderId) as HTMLDivElement;
    const followHeader = document.getElementById(followHeaderId) as HTMLDivElement;
    const searchHeader = document.getElementById(searchHeaderId) as HTMLDivElement;
    const contentForOptions = document.getElementById(contentForProfileOptionsId) as HTMLDivElement;
    if(!dashboardHeader || !matchHistoryHeader || !followHeader || !searchHeader || !contentForOptions) {
        console.error('One or more profile header elements not found');
        return;
    }
    contentForOptions.innerHTML = '';
    renderDashBoardContent();
    //console.log("dashboardHeader: ", dashboardHeader);
    dashboardHeader.addEventListener('click', (e) => {
        dashboardHeader.classList.remove('border-b-1', 'bg-gray-200');
        dashboardHeader.classList.add('opacity-100', 'font-bold');
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!followHeader.classList.contains('border-b-1')) {
            followHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            followHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!searchHeader.classList.contains('border-b-1')) {
            searchHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            searchHeader.classList.remove('opacity-100');
        }
        contentForOptions.innerHTML = '';
        renderDashBoardContent();
    });

    matchHistoryHeader.addEventListener('click', (e) => {
        matchHistoryHeader.classList.remove('border-b-1', 'bg-gray-200');
        matchHistoryHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!followHeader.classList.contains('border-b-1')) {
            followHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            followHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!searchHeader.classList.contains('border-b-1')) {
            searchHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            searchHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        renderGameHistory();
    });
    followHeader.addEventListener('click', (e) => {
        followHeader.classList.remove('border-b-1', 'bg-gray-200');
        followHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!searchHeader.classList.contains('border-b-1')) {
            searchHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            searchHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        contentForOptions.append(renderFriends());
    });
    searchHeader.addEventListener('click', (e) => {
        searchHeader.classList.remove('border-b-1', 'bg-gray-200');
        searchHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!followHeader.classList.contains('border-b-1')) {
            followHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-200');
            followHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        renderSearch();
    });


}


// export function renderFollowContent(): HTMLDivElement {
//     const followContent = document.createElement('div');
//     followContent.className = 'w-full h-full flex flex-col items-center justify-center';
//     followContent.innerHTML = `
//         <h2 class="text-2xl font-bold mb-4">Follow</h2>
//         <p class="text-gray-600">Welcome to your follow sec!</p>
//     `;
//     return followContent;
// }

// export function renderSearchContent(): HTMLDivElement {
//     const searchContent = document.createElement('div');
//     searchContent.className = 'w-full h-full flex flex-col items-center justify-center';
//     searchContent.innerHTML = `
//         <h2 class="text-2xl font-bold mb-4">Search</h2>
//         <p class="text-gray-600">Welcome to your search sec!</p>
//     `;
//     return searchContent;
// }

// export function renderMatchHistoryContent(): HTMLDivElement {
//     const matchHistoryContent = document.createElement('div');
//     matchHistoryContent.className = 'w-full h-full flex flex-col items-center justify-center';
//     matchHistoryContent.innerHTML = `
//         <h2 class="text-2xl font-bold mb-4">Match history</h2>
//         <p class="text-gray-600">Welcome to your match sec!</p>
//     `;
//     return matchHistoryContent;
// }