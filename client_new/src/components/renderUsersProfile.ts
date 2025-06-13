import Navigo from "navigo";
import { renderNav } from "./renderNavigation";
import { renderFooter } from "./renderFooter";
import { renderWholeUsersProfile } from "./utils/profileUtils/singleUserProfileUtils";
import { handleMenu } from "./utils/navigation/naviUtils";

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
