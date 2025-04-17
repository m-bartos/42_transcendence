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
    friendDbRecords: FriendDbRecords[];
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

async function getUserInfoInternal(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<AuthServiceResponseBody> {
  const { friendDbRecords } = request.body as FriendServiceRequestBody;

  if (!Array.isArray(friendDbRecords) || friendDbRecords.length === 0) {
    reply.code(400);
    return { status: "error", message: "friendDbRecords must be a non‑empty array" };
  }
  const friendIds = Array.from(new Set(friendDbRecords.map(r => r.friend_id)));
  try {
    const profiles = await this.dbSqlite<AuthServiceResponseData>("users").select("id", "username", "avatar").whereIn("id", friendIds);
    reply.code(200);
    return { status: "success", message: "user info", data: profiles };
  } catch (err) {
    this.log.error(err);
    reply.code(500);
    return { status: "error", message: err instanceof Error ? err.message : "internal server error" };
  }
}

export default getUserInfoInternal;
