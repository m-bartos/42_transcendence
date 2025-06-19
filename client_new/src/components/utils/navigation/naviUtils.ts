import { mainNavBarId, hamburgerBtnId, mobileLogoutBtnId, mobileMenuId, logoHolderId, logoutBtnId } from "../../renderNavigation";
import {logout} from "../../../api/login";

export function handleMenu() {
    const nav = document.getElementById(mainNavBarId) as HTMLDivElement;

    const hamburgerBtn = document.getElementById(hamburgerBtnId) as HTMLButtonElement;
    const mobileMenu = document.getElementById(mobileMenuId) as HTMLDivElement;
    const mobileLogoutBtn = document.getElementById(mobileLogoutBtnId) as HTMLButtonElement;
    const logoutBtn = document.getElementById(logoutBtnId) as HTMLButtonElement;

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

    if(hamburgerBtn) { 
        hamburgerBtn.addEventListener('click', () => {
            if (menuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if(mobileMenu) {
        mobileMenu.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            closeMenu();
        });
    });
    }
    // window.addEventListener('resize', () => {
    //     const isNowDesktop = window.innerWidth >= 768;
        
    //     if (isNowDesktop && menuOpen) {
    //         closeMenu();
    //         nav.classList.add('md:rounded-lg');
    //     }
    // });
    const handleMenuResize = () => {
        const isNowDesktop = window.innerWidth >= 768;
        
        if (isNowDesktop && menuOpen) {
            closeMenu();
            nav.classList.add('md:rounded-lg');
        }
    }
    window.addEventListener("resize", handleMenuResize);

};