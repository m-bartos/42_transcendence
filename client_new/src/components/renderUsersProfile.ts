import Navigo from "navigo";
import { renderNav } from "./renderNavigation";
import { renderFooter } from "./renderFooter";
import { renderWholeUsersProfile } from "./utils/profileUtils/singleUserProfileUtils";
import { handleMenu } from "./utils/navigation/naviUtils";


/**
 * Renders the profile of a single friend based on the provided friendId.
 * @param {Navigo} router - The router instance for navigation.
 * @param {string} friendId - The ID of the friend whose profile is to be rendered.
 */
export  function renderSingleFriendProfile(router: Navigo, friendId: string): void {
    const idOfFriend = parseInt(friendId, 10);
    document.title = "Pong - User Profile";
    const app = document.getElementById('app');
    if(!app) {
        console.error('No element with id="app" found.');
        return;
    };
    app.replaceChildren();
    try {
        renderNav(app);
        renderWholeUsersProfile(app, router, idOfFriend);
        renderFooter(app);
        handleMenu();
    }
    catch (error) {
        console.error('Error rendering home page:', error);
    }
};
