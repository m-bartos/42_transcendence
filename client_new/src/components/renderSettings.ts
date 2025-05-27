import Navigo from "navigo";
import { profileContentContainerId } from "./renderProfileContent";
import { renderNav } from "./renderNavigation";
import { renderFooter } from "./renderFooter";
import { renderProfileContent } from "./renderProfileContent";
import { handleMenu } from "./utils/navigation/naviUtils";

export function renderSettings(router: Navigo): void {

    document.title = "Pong - Settings";
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    app.className = "w-full md:container flex flex-col mx-auto min-h-dvh md:p-4"
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
    settingsPage.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center">
        <h2 class="text-2xl font-bold mb-4">Settings</h2>
        <p class="text-lg">Settings page is under construction.</p>
        <p class="text-sm">Please check back later.</p>
        </div>
    `;
    console.log("Settings page rendered successfully");
};