//import { logout } from '../auth.js';
//import {logout } from './utils/navigation/naviUtils';
import {home_page_url, login_url, game_multiplayer_url} from "../config/api_url_config";


export function renderNav(parentElement: HTMLElement): void {
    const nav = document.createElement('nav');
    nav.id = 'mainNavBar'
    nav.className = ' p-4 relative w-full border-b border-black/20';
    nav.innerHTML = `
        <div class="flex justify-around py-4 pr-4 md:py-0 md:justify-between items-center">
            <div id="logoHolder" class="hidden xs:inline-flex w-1/3">
                <a href="/" data-navigo>
                    <h2 class="text-3xl font-semibold opacity-85 text-center m-auto py-2 md:py-0 transition duration-100 ease-in hover:scale-105 hover:opacity-100">42 Pong</h2>
                </a>
            </div>
            <button id="hamburgerBtn" class="md:hidden  text-3xl focus:outline-none px-2 cursor-pointer">&#9776;</button>
            <div class="hidden md:flex flex-row text-3xl md:text-base items-center w-1/3">
                <a href=${game_multiplayer_url} data-navigo class="font-semibold  opacity-95 text-center m-auto py-2 md:py-0 transition duration-100 ease-in hover:scale-110">PLAY NOW</a>
            </div>
            
            <div id="desktopMenu" class="hidden md:flex flex-row text-3xl md:text-base justify-between xl:justify-end items-center w-1/3">
                <a href="/game" data-navigo class="font-semibold opacity-75 hover:opacity-100 m-auto md:pr-4 lg:pr-10 py-2 md:py-0 xl:m-0 xl:px-8 xl:w-[120px]">GAME</a>
                <a href="/profile" data-navigo class="font-semibold opacity-75 hover:opacity-100 m-auto md:pr-4 lg:pr-10 py-2 md:py-0 xl:m-0 xl:px-8 xl:w-[120px] xl:mr-8">PROFILE</a>
                <button id="logoutBtn" class="bg-gray-500 hover:bg-red-800 hover:ring-2 ring-gray-700 ring-inset text-white px-2 lg:px-4 py-1 rounded cursor-pointer mt-2 md:mt-0 xl:w-[120px] transition duration-100 ease-linear">Log Out</button>
            </div>
        </div>

        <!-- Mobile Menu with animation -->
        <div id="mobileMenu" class="transform scale-y-0 max-h-0 opacity-0 transition-all duration-500 ease-in-out origin-top absolute top-full left-0 w-full bg-gray-600/95 flex-col md:hidden rounded-b-lg z-50 overflow-hidden text-center">
            <a href="/" data-navigo class="block text-white  opacity-75 hover:opacity-100  text-3xl font-semibold px-4 py-6  border-y border-gray-500">Play NOW</a>
            <a href="/game" data-navigo class="block text-white opacity-75 hover:opacity-100  text-3xl font-semibold px-4 py-6 border-b border-gray-500">Game</a>
            <a href="/profile" data-navigo class="block text-white opacity-75 hover:opacity-100  text-3xl font-semibold px-4 py-6 border-b border-gray-500">Profile</a>
            <button id="mobileLogoutBtn" class="transition-opacity opacity-0 ease-out w-full text-center bg-gray-500/95 hover:bg-red-800/80 text-white text-3xl font-semibold px-auto py-6 cursor-pointer">Log Out</button>
        </div>
    `;
    parentElement.append(nav);
};

export const logoHolderId = 'logoHolder';
export const mobileMenuId = 'mobileMenu';
export const desktopMenuId = 'desktopMenu';
export const hamburgerBtnId = 'hamburgerBtn';
export const logoutBtnId = 'logoutBtn';
export const mobileLogoutBtnId = 'mobileLogoutBtn';
export const mainNavBarId = 'mainNavBar';
