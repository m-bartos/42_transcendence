import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface UserBody {
    username: string;
    email: string;
    password: string;
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

async function createUser(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply): Promise<UserResponse> {
    try {
        const {username, email, password} = request.body;
        const [id] = await this.dbSqlite('users').insert({username, email, password});
        reply.code(201);
        return {status: 'success', message: 'User created successfully.', data: {id, username, email}
        };
    } catch (error: unknown) {
        const sqliteError = error as { code?: string; message: string };
        if (sqliteError.code === 'SQLITE_CONSTRAINT') {
            reply.code(409);
            return {status: 'error', message: 'duplicate error', conflict: sqliteError.message};
        }
        else {
            reply.code(400);
            return {status: 'error', message: sqliteError.message};
        }
    }

}

export default createUser;