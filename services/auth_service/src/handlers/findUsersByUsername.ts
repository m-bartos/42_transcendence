import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {capitalizeFirstLetter} from "../utils/capitalizeFirstLetter.js";

interface FindUsersByUsernameRequestQuery {
    username: string;
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

async function findUsersByUsername(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<AuthServiceResponseBody> {
    const { username } = request.query as FindUsersByUsernameRequestQuery;
    try {
        // sqlite has limit max 999 results returned on this 'in' query
        const users = await this.dbSqlite<AuthServiceResponseData>("users").select("id", "username", "avatar")
            .whereLike("username", '%' + capitalizeFirstLetter(username) + '%')
            .whereLike("username", `%${username}%`)
            .whereLike("username", `%${username.toLowerCase()}%`)
            .where("active", true);
        reply.code(200);
        return { status: "success", message: "user info", data: users };
    }
    catch (err) {
        reply.code(500);
        return { status: "error", message: "internal server error" };
    }
}

export default findUsersByUsername;
