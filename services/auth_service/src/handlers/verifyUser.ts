import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {capitalizeFirstLetter} from "../utils/capitalizeFirstLetter.js";

// Define response types-match
interface SuccessResponse {
    status: 'success';
    message: string;
    data: {
        id: number
        username: string
    };
}

interface ErrorResponse {
    status: 'error';
    message: string;
}

type ValidateResponse = SuccessResponse | ErrorResponse;


interface UserBody {
    username: string;
    password: string;
}
interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    avatar: string;
    created_at: Date;
    updated_at: Date;
    active: boolean;
}

async function verifyUser(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply): Promise<ValidateResponse> {
    const {username, password} = request.body;
    try {
        const user: User | undefined = await this.dbSqlite<User>('users').select('*').where({username: capitalizeFirstLetter(username), active: true}).first();
        if (!user || !await this.comparePassword(password, user.password)) {
            reply.code(401);
            return {status: 'error', message: 'invalid username or password'};
        }
        reply.code(200);
        return {status: 'success', message: 'valid user' ,data: {username: user.username, id: user.id}};
    }
    catch (error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
        {
            const sqliteError = error as { code?: string; message: string };
            return {status: 'error', message: sqliteError.message};
        }
        return {status: 'error', message: 'internal server error'};
    }
}

export default verifyUser;