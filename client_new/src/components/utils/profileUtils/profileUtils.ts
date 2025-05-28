import { getUserInfo } from "../../../api/getUserInfo";
import { profileContentContainerId } from "../../renderProfileContent";
import Navigo from "navigo";

export async function renderUserProfile(userProfileContainer: HTMLElement): Promise<void> {
    if (!userProfileContainer) {
        console.error("User profile container not found");
        return;
    }
    userProfileContainer.innerHTML = ""; // Clear existing content
    const userProfile = document.createElement("div");
    userProfile.id = "userProfileContent";
    userProfile.className = "flex flex-col items-center min-w-full max-w-1/4 overflow-hidden rounded-2xl";

    const userAvatar = document.createElement("img");
    userAvatar.id = "avatarImage";
    userAvatar.alt="Users avatar";
    userAvatar.className = "w-30 h-30 rounded-full mb-4 border-1 border-gray-500 max-w-full";

    const userName = document.createElement("h2");
    userName.id = "userName";
    userName.className = "max-w-full text-xl font-semibold my-2 wrap-anywhere";
    userName.textContent = "User Name";

    const userEmail = document.createElement("p");
    userEmail.id = "userEmail";
    userEmail.className = "max-w-full text-sm my-4 wrap-anywhere";
    userEmail.textContent = "User Email";

    const settingsButton = document.createElement("button");
    settingsButton.id = "settingsButton";
    settingsButton.className = "tech-button min-w-28 w-36 py-1 my-8";
    settingsButton.textContent = "Settings";
    
    const linkSettings = document.createElement("a");
    linkSettings.setAttribute("data-navigo", "data-navigo");
    linkSettings.href = "/settings";

    linkSettings.append(settingsButton);

    userProfile.appendChild(userAvatar);
    userProfile.appendChild(userName);
    userProfile.appendChild(userEmail);
    userProfile.appendChild(linkSettings);
    userProfileContainer.appendChild(userProfile);

    try {
      const user = await getUserInfo();
      
      if (user) {
          userAvatar.src = user.avatar;
          userName.textContent = user.username;
          userEmail.textContent = user.email;
      } 
      else {
        console.log("User profile: not found");
      }
    } catch (error) {
      console.error("Error rendering user profile:", error);
    }
} 


