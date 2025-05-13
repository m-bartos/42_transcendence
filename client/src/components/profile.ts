import { renderUser } from './renderUser.js';
import { renderFriends } from './renderFriends.js';
import { renderDashBoardContent } from './renderDashBoard.js';

export function renderProfile(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bg-white rounded-lg flex flex-col lg:flex-row justify-center lg:justify-start text-gray-800';
    // document.addEventListener('DOMContentLoaded', () => {
    //     const mainContentElement = document.getElementById('mainContainer');

    // });
    //create and add user info element-----------------------------------------
    const userProfileContainer = document.createElement('div');
    userProfileContainer.className = 'flex lg:pt-12 items-center w-full lg:w-1/5 min-w-[500px] lg:min-w-[240px] justify-center p-4 lg:border-r border-gray-200 ';
    if(userProfileContainer && container) {
        userProfileContainer.append(renderUser());
    }
    container.append(userProfileContainer);

    //build and add profile/game/dashboard/serach element--------------------------
    const profileContainer = document.createElement('div');
    profileContainer.className = 'flex flex-col w-full lg:w-4/5 min-w-[500px] p-4';
    
    const profileOptionsContainer = document.createElement('div');
    profileOptionsContainer.className = 'mt-8 lg:mt-0 border-t-1 border-gray-200 lg:border-t-0 grid grid-cols-4 items-center h-12 divide-x divide-gray-200';

    const dashboardHeader = document.createElement('div');
    dashboardHeader.className = 'flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 text-gray-900 font-semibold hover:font-bold  border-gray-200';
    dashboardHeader.innerHTML = '<p>dashboard</p>';
    const matchHistoryHeader = document.createElement('div');
    matchHistoryHeader.className = 'flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 text-gray-900 font-semibold hover:font-bold border-b-1 border-gray-200 bg-gray-50';
    matchHistoryHeader.innerHTML = '<p>match history</p>';
    const followHeader = document.createElement('div');
    followHeader.className = 'flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 text-gray-900 font-semibold hover:font-bold border-b-1 border-gray-200 bg-gray-50';
    followHeader.innerHTML = '<p>follow</p>';
    const searchHeader = document.createElement('div');
    searchHeader.className = 'flex justify-center h-full items-center hover:cursor-pointer opacity-75 hover:opacity-100 text-gray-900 font-semibold hover:font-bold border-b-1 border-gray-200 bg-gray-50';
    searchHeader.innerHTML = '<p>search</p>';

    profileOptionsContainer.append(dashboardHeader, matchHistoryHeader, followHeader, searchHeader);
    profileContainer.append(profileOptionsContainer);

    //build and add content to the profile options-----------------------------------
    const contentForOptions = document.createElement('div');
    contentForOptions.className = 'flex mt-4';
    //pri prvnim zavolani profile se defaultne vykresli dashboard
    contentForOptions.append(renderDashBoardContent());

    profileContainer.append(contentForOptions);

    //--------------------------------------------------------------------------------
    
    dashboardHeader.addEventListener('click', (e) => {
        dashboardHeader.classList.remove('border-b-1', 'bg-gray-50');
        dashboardHeader.classList.add('opacity-100', 'font-bold');
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!followHeader.classList.contains('border-b-1')) {
            followHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            followHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!searchHeader.classList.contains('border-b-1')) {
            searchHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            searchHeader.classList.remove('opacity-100');
        }
        contentForOptions.innerHTML = '';
        contentForOptions.append(renderDashBoardContent());
    });

    matchHistoryHeader.addEventListener('click', (e) => {
        matchHistoryHeader.classList.remove('border-b-1', 'bg-gray-50');
        matchHistoryHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!followHeader.classList.contains('border-b-1')) {
            followHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            followHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!searchHeader.classList.contains('border-b-1')) {
            searchHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            searchHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        contentForOptions.append(renderDashBoardContent());
    });
    followHeader.addEventListener('click', (e) => {
        followHeader.classList.remove('border-b-1', 'bg-gray-50');
        followHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!searchHeader.classList.contains('border-b-1')) {
            searchHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            searchHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        contentForOptions.append(renderFriends());
    });
    searchHeader.addEventListener('click', (e) => {
        searchHeader.classList.remove('border-b-1', 'bg-gray-50');
        searchHeader.classList.add('opacity-100');
        if(!dashboardHeader.classList.contains('border-b-1')) {
            dashboardHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            dashboardHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!matchHistoryHeader.classList.contains('border-b-1')) {
            matchHistoryHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            matchHistoryHeader.classList.remove('opacity-100', 'font-bold');
        }
        if(!followHeader.classList.contains('border-b-1')) {
            followHeader.classList.add('border-b-1', 'opacity-75', 'bg-gray-50');
            followHeader.classList.remove('opacity-100', 'font-bold');
        }
        contentForOptions.innerHTML = '';
        contentForOptions.append(renderDashBoardContent());
    });
    
    
    
    
    
    container.append(profileContainer);



    return container;
};