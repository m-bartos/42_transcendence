import storage from "../messageRouting/connectionStorage.js";

export function reportUserOnlineStatus()
{
    const interval = setInterval(() => {
        console.log("Online Users: ", storage.getTotalUserStorageCount());
        console.log("User Ids: ", storage.getAllUsers());
        console.log("Users and Sessions: ", storage.getAllUsersAndSessions());
    }, 5000)
}


