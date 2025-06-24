import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {capitalizeFirstLetter} from "../utils/capitalizeFirstLetter.js";

interface UserBody {
    username: string;
    email: string;
    password: string;
    filePath?: string | undefined;
}

interface UserResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        id: number;
        username: string;
        email: string;
    };
    conflict?: string;
}

interface Sqlite3Error extends Error {
    code?: string
}

async function createUser(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply): Promise<UserResponse> {
    try {
        const {username, email, password} = request.body;
        const hashedPassword: string = await this.hashPassword(password);
        const capitalizedUsername = capitalizeFirstLetter(username);
        const [id] = await this.dbSqlite('users').insert({username: capitalizedUsername, email: email.toLowerCase(), password: hashedPassword});
        reply.code(201);
        return {status: 'success', message: 'User created successfully.', data: {id: id, username: capitalizedUsername, email: email}
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            const sqliteError = error as Sqlite3Error; // Narrow to sqlite3 shape
            if (sqliteError.code === 'SQLITE_CONSTRAINT')
            {
                reply.code(409);
                if (sqliteError.message.includes('users.username')){
                    sqliteError.message = 'username';
                }
                else if (sqliteError.message.includes('users.email')){
                    sqliteError.message = 'email';
                }
                return {status: 'error', message: 'duplicate error', conflict: sqliteError.message};
            } else {
                reply.code(500);
                return {status: 'error', message: sqliteError.message};
            }
        }
        reply.code(500);
        return {status: 'error', message: 'internal server error'};
    }
}

export default createUser;