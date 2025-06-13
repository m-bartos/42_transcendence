import Navigo from 'navigo';
import { dashboardHeaderId, matchHistoryHeaderId, followHeaderId, searchHeaderId, contentForProfileOptionsId } from '../../renderProfileContent';
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
    renderDashBoardContent(contentForOptions);
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
        renderDashBoardContent(contentForOptions);
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
        renderGameHistory(router, contentForOptions);
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
        contentForOptions.append(renderFriends(router));
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