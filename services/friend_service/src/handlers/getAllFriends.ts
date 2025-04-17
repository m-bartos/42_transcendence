import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import { decryptUserId } from "../utils/secureUserId.js";
import { AuthUserData, FriendServiceResponseData, FriendDbRecords, mergeData } from '../agregators/dataAggregator.js';
import { fetchOnlineUserStatuses } from "../agregators/fetchPresenceUserData.js";
import { fetchAuthServiceUserData } from "../agregators/fetchAuthUserData.js";


// // Mock profiles for testing
// export const mockProfiles: ProfileData[] = [
//     { user_id: "1", username: "alice",  avatar_url: "https://i.pravatar.cc/150?img=1" },
//     { user_id: "2", username: "bob",    avatar_url: "https://i.pravatar.cc/150?img=2" },
//     { user_id: "3", username: "charlie",avatar_url: "https://i.pravatar.cc/150?img=3" },
//     { user_id: "4", username: "dave",   avatar_url: "https://i.pravatar.cc/150?img=4" },
//     { user_id: "5", username: "eve",    avatar_url: "https://i.pravatar.cc/150?img=5" },
//     { user_id: "6", username: "frank",  avatar_url: "https://i.pravatar.cc/150?img=6" },
//     { user_id: "7", username: "grace",  avatar_url: "https://i.pravatar.cc/150?img=7" },
//     { user_id: "8", username: "heidi",  avatar_url: "https://i.pravatar.cc/150?img=8" },
//     { user_id: "24", username: "mira",  avatar_url: "https://i.pravatar.cc/150?img=24" },
// ];

export async function getAllFriends(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { jwt_payload } = request;
    try {
        const userId = decryptUserId(jwt_payload?.sub);
        const friendDbRecords: FriendDbRecords[] = await this.dbSqlite('friends').select("user_id", "friend_id", "online_status").where({user_id: userId, status: 'active'});
        const usersOnline = await fetchOnlineUserStatuses(jwt_payload?.token);
        const authUserData: AuthUserData[] = await fetchAuthServiceUserData(jwt_payload?.token, friendDbRecords);
        const friendsData: FriendServiceResponseData[] = mergeData(friendDbRecords, usersOnline, authUserData);
        reply.code(200);
        return {status: "success", message: "friendDbRecords list", data: friendsData};
    }
    catch (error) {
        reply.code(500);
        return {status: "error", message: 'internal server error'};
    }
}