import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {decryptUserId, encryptUserId} from "../utils/secureUserId.js";

interface responseBody {
    status: string;
    message: string;
    data?: any;
}

interface UserBody {
    mfa: string;
}

interface UserInfo {
    user_id: number;
    username: string;
    email: string;
    mfa: boolean;
    mfa_otp: string;
}

async function verifyMfa(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<responseBody> {
    const { jwt_payload } = request;
    // @ts-ignore
    const { mfa } = request.body;
    const userId = decryptUserId(jwt_payload?.sub);
    try
    {
        if (!userId)
        {
            reply.code(401);
            return {status: 'error', message: 'unauthorized.'};
        }
        const userInfo: UserInfo = await this.dbSqlite('users').where({id: userId, active: true, mfa: true}).first();
        if (!userInfo || !userInfo.mfa_otp || !mfa)
        {
            reply.code(401);
            return {status: 'error', message: 'mfa not activated.'};
        }

        if (!await this.comparePassword(mfa, userInfo.mfa_otp)) {
            reply.code(401);
            return {status: 'error', message: 'invalid OTP code'};
        }

        const newSession =
            {
                user_id: userId,
                session_id : crypto.randomUUID(),
                ip_address: request.ip || 'unknown',
                user_agent: request.headers['user-agent'] || 'unknown',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        await this.dbSqlite('sessions').insert(newSession);
        const token: string = this.jwt.sign({ jti: newSession.session_id, sub: encryptUserId(newSession.user_id.toString()) });
        reply.code(200);
        return {status: 'success', message: 'user logged in' , data: {token: token}};
    }
    catch(error: unknown)
    {
        reply.code(500);
        if (error instanceof Error)
            return {status: 'error', message: error.message};
        else
            return {status: 'error', message: 'internal server error'};
    }
}

export default verifyMfa;