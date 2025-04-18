import {FriendDbRecords} from "../agregators/dataAggregator.js";

export function extractFriendIds(friendDbRecords: FriendDbRecords[]) {
    try {
        return Array.from(new Set(friendDbRecords.map(r => r.friend_id.toString())));
    }
    catch (error) {
        return [];
    }
}