export interface FriendData {
    user_id:         number  | null;
    friend_id:       number  | null;
    friend_username: string  | null;
    avatar_url:      string  | null;
    online_status:   'online' | 'offline' | null;
}

export interface ProfileData {
    user_id:    string;
    username:   string;
    avatar_url: string;
}

export interface UserRecord {
    id:            string;
    user_id:       string;
    friend_id:     string;
    status:        string;
    online_status: string;
    created_at:    string;
    updated_at:    string;
}

// statuses -- an array of friend_ids (number)
// profiles -- an array of ProfileData
// friends   -- an array of UserRecord

export function mergeData(friends: UserRecord[], statuses: number[], profiles: ProfileData[]): FriendData[] {
    const friendsData: FriendData[] = [];
    mergeFriendsWithUserRecords(friends, friendsData);
    mergeFriendsWithStatuses(statuses,  friendsData);
    mergeFriendsWithProfiles(profiles,   friendsData);
    return friendsData;
}

function mergeFriendsWithUserRecords(friends:     UserRecord[], friendsData: FriendData[]): void {
    try {
        for (const rec of friends) {
            const uid = Number(rec.user_id);
            const fid = Number(rec.friend_id);
            friendsData.push({
                user_id:         Number.isNaN(uid) ? null : uid,
                friend_id:       Number.isNaN(fid) ? null : fid,
                friend_username: null,
                avatar_url:      null,
                online_status:   null,
            });
        }
    } catch (err) {
        console.error('mergeFriendsWithUserRecords failed:', err);
    }
}

function mergeFriendsWithStatuses(statuses: number[], friendsData: FriendData[]): void {
    try {
        for (const fd of friendsData) {
            if (fd.friend_id === null) {
                fd.online_status = null;
            } else {
                fd.online_status = statuses.includes(fd.friend_id) ? 'online' : 'offline';
            }
        }
    } catch (err) {
        console.error('mergeFriendsWithStatuses failed:', err);
    }
}

function mergeFriendsWithProfiles(profiles: ProfileData[], friendsData: FriendData[]): void {
    try {
        // build a lookup from friend_id → ProfileData
        const profileMap = new Map<number, ProfileData>();
        for (const p of profiles) {
            const pid = Number(p.user_id);
            if (!Number.isNaN(pid)) {
                profileMap.set(pid, p);
            }
        }
        for (const fd of friendsData) {
            if (fd.friend_id === null) {
                fd.friend_username = null;
                fd.avatar_url      = null;
            } else {
                const prof = profileMap.get(fd.friend_id);
                fd.friend_username = prof?.username   ?? null;
                fd.avatar_url      = prof?.avatar_url ?? null;
            }
        }
    } catch (err) {
        console.error('mergeFriendsWithProfiles failed:', err);
    }
}
