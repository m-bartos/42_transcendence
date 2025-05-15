import { logout } from '../auth.js';


export function renderNav(): HTMLElement {
    const nav = document.createElement('nav');
    nav.id = 'mainNavBar'
    nav.className = ' p-4 relative w-full border-b border-black/20 text-gray-700 md:mt-6 ';
    
    nav.innerHTML = `
        <div class="flex justify-around py-4 pr-4 md:py-0 md:justify-between items-center">
            <div class="hidden xs:inline-flex w-1/3">
                <a href="/" data-link>
                    <h2 class="text-3xl font-semibold opacity-85 text-center m-auto py-2 md:py-0 transition duration-100 ease-in hover:scale-105 hover:opacity-100">42 Pong</h2>
                </a>
            </div>
            <button id="hamburgerBtn" class="md:hidden text-black/80 text-3xl focus:outline-none px-2 cursor-pointer">&#9776;</button>
            <div class="hidden md:flex flex-row text-3xl md:text-base items-center w-1/3">
                <a href="/" data-link class="font-semibold text-black opacity-95 text-center m-auto py-2 md:py-0 transition duration-100 ease-in hover:scale-110">PLAY NOW</a>
            </div>
            
            <div id="desktopMenu" class="hidden md:flex flex-row text-3xl md:text-base justify-between xl:justify-end items-center w-1/3">
                <a href="/game" data-link class="font-semibold text-black/80 opacity-75 hover:opacity-100 m-auto md:pr-4 lg:pr-10 py-2 md:py-0 xl:m-0 xl:px-8 xl:w-[120px]">GAME</a>
                <a href="/profile" data-link class="font-semibold text-black/80 opacity-75 hover:opacity-100 m-auto md:pr-4 lg:pr-10 py-2 md:py-0 xl:m-0 xl:px-8 xl:w-[120px] xl:mr-8">PROFILE</a>
                <button id="logoutBtn" class="bg-gray-500 hover:bg-red-800 hover:ring-2 ring-gray-700 ring-inset text-white px-2 lg:px-4 py-1 rounded cursor-pointer mt-2 md:mt-0 xl:w-[120px] transition duration-100 ease-linear">Log Out</button>
            </div>
        </div>

        <!-- Mobile Menu with animation -->
        <div id="mobileMenu" class="transform scale-y-0 max-h-0 opacity-0 transition-all duration-500 ease-in-out origin-top absolute top-full left-0 w-full bg-gray-600/95 flex-col md:hidden rounded-b-lg z-50 overflow-hidden text-center">
            <a href="/" data-link class="block text-white  opacity-75 hover:opacity-100  text-3xl font-semibold px-4 py-6  border-y border-gray-500">Play NOW</a>
            <a href="/game" data-link class="block text-white opacity-75 hover:opacity-100  text-3xl font-semibold px-4 py-6 border-b border-gray-500">Game</a>
            <a href="/friends" data-link class="block text-white opacity-75 hover:opacity-100  text-3xl font-semibold px-4 py-6 border-b border-gray-500">Profile</a>
            <button id="mobileLogoutBtn" class="transition-opacity opacity-0 ease-out w-full text-center bg-gray-500/95 hover:bg-red-800/80 text-white text-3xl font-semibold px-auto py-6 cursor-pointer">Log Out</button>
        </div>
    `;
    
    setTimeout(() => {
        const hamburgerBtn = document.getElementById('hamburgerBtn') as HTMLButtonElement;
        const mobileMenu = document.getElementById('mobileMenu') as HTMLDivElement;
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn') as HTMLButtonElement;
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logout);
        }

        let menuOpen = false;

        const openMenu = () => {
            mobileMenu.classList.remove('scale-y-0', 'max-h-0', 'opacity-0');
            mobileMenu.classList.add('scale-y-100', 'max-h-screen', 'opacity-100');
            mobileLogoutBtn.classList.remove('opacity-0');
            nav.classList.remove('md:rounded-lg');
            nav.classList.add('md:rounded-t-lg');
            hamburgerBtn.innerHTML = '&#10005;';
            menuOpen = true;
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('scale-y-100', 'max-h-screen', 'opacity-100');
            mobileMenu.classList.add('scale-y-0', 'max-h-0', 'opacity-0');
            mobileLogoutBtn.classList.add('opacity-0');
            nav.classList.remove('md:rounded-t-lg');
            nav.classList.add('md:rounded-lg');
            hamburgerBtn.innerHTML = '&#9776;';
            menuOpen = false;
        };

        hamburgerBtn.addEventListener('click', () => {
        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
        });

        mobileMenu.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('click', () => {
                closeMenu();
            });
        });
        window.addEventListener('resize', () => {
            const isNowDesktop = window.innerWidth >= 768;
          
            if (isNowDesktop && menuOpen) {
              closeMenu();
              nav.classList.add('md:rounded-lg');
            }
        });
    }, 0);
    
    return nav;
}