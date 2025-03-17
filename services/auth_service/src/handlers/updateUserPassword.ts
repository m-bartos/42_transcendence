import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {UserId, getUserId} from "../utils/dbQueries.js";

interface UserBody {
    password: string;
    newPassword?: string;
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

async function updateUserPassword(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply) {
    const {password, newPassword} = request.body;
    try {
        if (!password || !newPassword) {
            reply.code(400);
            return {status: 'error', message: 'malformed request'};
        }
        const hashedPassword = await this.hashPassword(newPassword);
        const userId: UserId | undefined = await getUserId(this, request);
        if (!userId) {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        const user: User | undefined = await this.dbSqlite<User>('users').select('*').where({id: userId.user_id, active: true}).first();
        if (!user || !await this.comparePassword(password, user.password)) {
            reply.code(401);
            return {status: 'error', message: 'invalid password'};
        }
        const result: number = await this.dbSqlite<User>('users').where({
            id: userId.user_id,
            active: true
        }).update({'password': hashedPassword});
        if (!result) {
            reply.code(401);
            return {status: 'error', message: 'unauthorized'};
        }
        // this will be moved to post response hook
        const sessions: number = await this.dbSqlite('sessions').where('user_id', userId.user_id).update('revoked', true);
        if (!sessions) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }
        //
        reply.code(200);
        return {status: 'success', message: 'password updated'};
    }
    catch (error: unknown) {
        reply.code(500);
        if (error instanceof Error)
            return {status: 'error', message: error.message};
        return {status: 'error', message: 'internal server error'};
    }
}

export default updateUserPassword;