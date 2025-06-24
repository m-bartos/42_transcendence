import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {getUserId, UserId} from "../utils/dbQueries.js";
import {capitalizeFirstLetter} from "../utils/capitalizeFirstLetter.js";

interface UserBody {
    username: string;
    email: string;
    mfa?: boolean;
}

interface ResponseBody {
    status: string,
    message: string,
    conflict?: string
}

interface Sqlite3Error extends Error {
    code?: string
}

async function updateUser(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply): Promise<ResponseBody> {
    const {username, email, mfa} = request.body;
    try
    {
        const userId: UserId | undefined = await getUserId(this, request);
        if (userId)
        {
            let lowerCaseEmail = null;
            let capitalizedUsername = null;
            if (email)
            {
                lowerCaseEmail = email.toLowerCase();
            }
            else {
                lowerCaseEmail = email;
            }
            if (username)
            {
                capitalizedUsername = capitalizeFirstLetter(username);
            }
            else {
                capitalizedUsername = username;
            }
            const updated: number = await this.dbSqlite('users').where('id', userId.user_id).update({'username': capitalizedUsername, 'email': lowerCaseEmail, 'mfa': mfa});
            if (updated)
            {
                reply.code(200);
                return {status: 'success', message: 'user updated successfully.'};
            }
            reply.code(400);
            return {status: 'error', message: 'user update failed.'};
        }
        reply.code(401);
        return {status: 'error', message: 'unauthorized'};
    }
    catch (error: unknown) {
        if (error instanceof Error)
        {
            const sqliteError = error as Sqlite3Error; // Narrow to sqlite3 shape
            if (sqliteError.code === 'SQLITE_CONSTRAINT')
            {
                reply.code(409);
                if (sqliteError.message.includes('users.username'))
                {
                    sqliteError.message = 'username';
                } else if (sqliteError.message.includes('users.email'))
                {
                    sqliteError.message = 'email';
                }
                return {status: 'error', message: 'duplicate error', conflict: sqliteError.message};
            }
            reply.code(500);
            console.log(error);
            return {status: 'error', message: error.message};
        }
        return {status: 'error', message: 'internal server error'};
    }
}

export default updateUser;