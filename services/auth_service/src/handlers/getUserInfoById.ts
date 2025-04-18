import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export interface FriendDbRecords {
    id:            string;
    user_id:       string;
    friend_id:     string;
    status:        string;
    online_status: string;
    created_at:    string;
    updated_at:    string;
}

interface FriendServiceRequestBody {
    friendDbIds: string[];
}

interface AuthServiceResponseBody {
    status:  "success" | "error";
    message: string;
    data?:   unknown;
}

interface AuthServiceResponseData {
    user_id:    string;
    username:   string;
    avatar_url: string;
}

async function getUserInfoById(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<AuthServiceResponseBody> {
    const { friendDbIds } = request.body as FriendServiceRequestBody;
    if (!Array.isArray(friendDbIds)) {
        reply.code(400);
        return { status: "error", message: "payload must be an array" };
    }
    try {
        // sqlite has limit max 999 results returned on this 'in' query
        const friends = await this.dbSqlite<AuthServiceResponseData>("users").select("id", "username", "avatar").whereIn("id", friendDbIds);
        reply.code(200);
    return { status: "success", message: "friends info", data: friends };
    }
    catch (err) {
        reply.code(500);
        return { status: "error", message: "internal server error" };
    }
}

export default getUserInfoById;
