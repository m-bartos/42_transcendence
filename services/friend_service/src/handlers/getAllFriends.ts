import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import { decryptUserId } from "../utils/secureUserId.js";
import { ProfileData, FriendData, UserRecord, mergeData } from '../agregators/dataMerger.js';
import { fetchUserStatuses } from "../agregators/fetchStatuses.js";


// Mock profiles for testing
export const mockProfiles: ProfileData[] = [
    { user_id: "1", username: "alice",  avatar_url: "https://i.pravatar.cc/150?img=1" },
    { user_id: "2", username: "bob",    avatar_url: "https://i.pravatar.cc/150?img=2" },
    { user_id: "3", username: "charlie",avatar_url: "https://i.pravatar.cc/150?img=3" },
    { user_id: "4", username: "dave",   avatar_url: "https://i.pravatar.cc/150?img=4" },
    { user_id: "5", username: "eve",    avatar_url: "https://i.pravatar.cc/150?img=5" },
    { user_id: "6", username: "frank",  avatar_url: "https://i.pravatar.cc/150?img=6" },
    { user_id: "7", username: "grace",  avatar_url: "https://i.pravatar.cc/150?img=7" },
    { user_id: "8", username: "heidi",  avatar_url: "https://i.pravatar.cc/150?img=8" },
    { user_id: "24", username: "mira",  avatar_url: "https://i.pravatar.cc/150?img=24" },
];




// ! you have changed the jwt payload shape for inner service authentication
export async function getAllFriends(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { jwt_payload } = request;

    try {
        const userId = decryptUserId(jwt_payload?.sub);
        // maybe remove user_id - not needed, its implicit
        const friends: UserRecord[] = await this.dbSqlite('friends').select("user_id", "friend_id", "online_status").where({user_id: userId, status: 'active'});
        // get online users
        // parse match them with friendsId
        const usersOnline = await fetchUserStatuses(jwt_payload?.token);
        console.log("UsersOnline", usersOnline);
        // call auth service and retrieve usernames
        // need to create the endpoint to get usernames for userId
        const friendsData: FriendData[] = mergeData(friends, usersOnline, mockProfiles);
        reply.code(200);
        return {status: "success", message: "friends list", data: friendsData};
    }
    catch (error) {
        reply.code(500);
        return {status: "error", message: 'internal server error'};
    }
}