// Data returned by Friend service API
export interface FriendServiceResponseData {
    user_id:         number  | null;
    friend_id:       number  | null;
    friend_username: string  | null;
    avatar_url:      string  | null;
    online_status:   'online' | 'offline' | null;
}
// Data to get from Auth service
export interface AuthUserData {
    id:       number;
    username: string;
    avatar:   string | null;
}

// Data as they are stored in the Friend service DB
export interface FriendDbRecords {
    id:            string;
    user_id:       string;
    friend_id:     string;
    status:        string;
    online_status: string;
    created_at:    string;
    updated_at:    string;
}

// Method that merges data into single response object for the friend service API
export function mergeData(friendRecords: FriendDbRecords[], onlineStatusData: number[], authUserData: AuthUserData[]): FriendServiceResponseData[] {
    const friendServiceResponseData: FriendServiceResponseData[] = [];
    mergeFriendsResponseDataWithFriendUserRecords(friendRecords, friendServiceResponseData);
    mergeFriendsResponseDataWithOnlineStatuses(onlineStatusData, friendServiceResponseData);
    mergeFriendsResponseDataWithAuthServiceData(authUserData, friendServiceResponseData);
    return friendServiceResponseData;
}
// transforms data from friend db table into a new response object
function mergeFriendsResponseDataWithFriendUserRecords(friendDbRecords: FriendDbRecords[], friendServiceResponseData: FriendServiceResponseData[]): void {
    try {
        for (const rec of friendDbRecords) {
            const uid = Number(rec.user_id);
            const fid = Number(rec.friend_id);
            friendServiceResponseData.push({
                user_id:         Number.isNaN(uid) ? null : uid,
                friend_id:       Number.isNaN(fid) ? null : fid,
                friend_username: null,
                avatar_url:      null,
                online_status:   'offline',
            });
        }
    } catch (err) {
        console.error('mergeFriendsResponseDataWithFriendUserRecords failed:', err);
    }
}

function mergeFriendsResponseDataWithOnlineStatuses(onlineUserStatuses: number[], friendServiceResponseData: FriendServiceResponseData[]): void {
    try {
        for (const fd of friendServiceResponseData) {
            if (fd.friend_id === null) {
                fd.online_status = null;
            } else {
                fd.online_status = onlineUserStatuses.includes(fd.friend_id) ? 'online' : 'offline';
            }
        }
    } catch (err) {
        console.error('mergeFriendsResponseDataWithOnlineStatuses failed:', err);
    }
}

function mergeFriendsResponseDataWithAuthServiceData(authUserData: AuthUserData[], friendServiceResponseData: FriendServiceResponseData[]): void {
    try {
        const profileMap = new Map<number, AuthUserData>();
        for (const p of authUserData) {
            profileMap.set(p.id, p);
        }

        for (const fd of friendServiceResponseData) {
            if (fd.friend_id === null) {
                fd.friend_username = null;
                fd.avatar_url      = null;
            } else {
                const prof = profileMap.get(fd.friend_id);
                fd.friend_username = prof?.username ?? null;
                fd.avatar_url = prof?.avatar   ?? null;
            }
        }
    } catch (err) {
        console.error('mergeFriendsResponseDataWithAuthServiceData failed:', err);
    }
}
