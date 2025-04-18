import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { decryptUserId } from "../utils/secureUserId.js";
import { extractFriendIds } from "../utils/extractFriendIds.js";
import { AuthUserData, FriendServiceResponseData, FriendDbRecords, mergeData } from '../agregators/dataAggregator.js';
import { fetchOnlineUserStatuses } from "../agregators/fetchPresenceUserData.js";
import { fetchAuthServiceUserData } from "../agregators/fetchAuthUserData.js";

export async function getAllFriends(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { jwt_payload } = request;
    try {
        const userId = decryptUserId(jwt_payload?.sub);
        const friendDbRecords: FriendDbRecords[] = await this.dbSqlite('friends').select("user_id", "friend_id", "online_status").where({user_id: userId, status: 'active'});
        const usersOnline = await fetchOnlineUserStatuses(jwt_payload?.token);
        const authUserData: AuthUserData[] = await fetchAuthServiceUserData(jwt_payload?.token, extractFriendIds(friendDbRecords));
        const friendsData: FriendServiceResponseData[] = mergeData(friendDbRecords, usersOnline, authUserData);
        reply.code(200);
        return {status: "success", message: "friendDbRecords list", data: friendsData};
    }
    catch (error) {
        reply.code(500);
        return {status: "error", message: 'internal server error'};
    }
}
