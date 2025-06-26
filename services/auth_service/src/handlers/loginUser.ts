import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { encryptUserId } from '../utils/secureUserId.js'
import {sendEmailOtp} from "../utils/sendEmailOtp.js";
import {capitalizeFirstLetter} from "../utils/capitalizeFirstLetter.js";

// Define response types-match
interface SuccessResponse {
    status: 'success';
    message: string;
    data: { token: string;
            mfa: boolean;
    };
}

interface ErrorResponse {
    status: 'error';
    message: string;
}

type LoginResponse = SuccessResponse | ErrorResponse;


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
    mfa: boolean;
}
function generate6DigitNumberString() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


async function loginUser(this: FastifyInstance, request: FastifyRequest<{Body: UserBody}>, reply: FastifyReply): Promise<LoginResponse> {
    const {username, password} = request.body;
    try {
        const user: User | undefined = await this.dbSqlite<User>('users').select('*').where({username: capitalizeFirstLetter(username), active: true}).first();
        if (!user || !await this.comparePassword(password, user.password)) {
            reply.code(401);
            return {status: 'error', message: 'invalid username or password'};
        }

        if (!user.mfa)
        {
            const newSession =
                {
                    user_id: user.id,
                    session_id : crypto.randomUUID(),
                    ip_address: request.ip || 'unknown',
                    user_agent: request.headers['user-agent'] || 'unknown',
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }
            try
            {
                await this.dbSqlite('sessions').insert(newSession);
                const token: string = this.jwt.sign({ jti: newSession.session_id, sub: encryptUserId(newSession.user_id.toString()) });
                reply.code(200);
                return {status: 'success', message: 'user logged in' , data: {token: token, mfa: false}};
            }
            catch (error)
            {
                reply.code(500);
                return {status: 'error', message: 'failed to create session'};
            }
        }
       else {
            try {
                const otpCode = generate6DigitNumberString();
                console.log('-------------------------------------------------------------------------------------');
                console.log('-------------------------------------------------------------------------------------');
                console.log('YOUR MFA OTP CODE: ', otpCode);
                console.log('-------------------------------------------------------------------------------------');
                console.log('-------------------------------------------------------------------------------------');
                await sendEmailOtp(user.email, otpCode); // TODO: uncomment this!!
                const hashedCode: string = await this.hashPassword(otpCode);
                await this.dbSqlite('users').where('id', user.id).update({'mfa_otp': hashedCode});
            }
            catch (error)
            {
                reply.code(500);
                return {status: 'error', message: 'failed to send otp message'};
            }
            const token: string = this.jwt.sign({ jti: crypto.randomUUID(), sub: encryptUserId(user.id.toString()) });
            reply.code(200);
            return {status: 'success', message: 'OTP code has been send to your registered email' , data: {token: token, mfa: true}};
        }

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

export default loginUser;