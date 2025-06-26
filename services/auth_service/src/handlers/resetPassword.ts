import {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {decryptUserId, encryptUserId} from "../utils/secureUserId.js";
import updateUserPassword from "./updateUserPassword.js";
import {capitalizeFirstLetter} from "../utils/capitalizeFirstLetter.js";
import {sendEmailResetPassword} from "../utils/sendEmailOtp.js";

interface responseBody {
    status: string;
    message: string;
    data?: any;
}

interface resetPasswordBody {
    username: string;
    email: string;
}

interface UserInfo {
    user_id: number;
    username: string;
    email: string;
    mfa: boolean;
    mfa_otp: string;
}

function generatePassword(len: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < len; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }

    return password;
}

async function resetPassword(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<responseBody> {
    // const { jwt_payload } = request;

    try
    {
        const { username, email } = request.body as resetPasswordBody;
        const capitalizedUsername = capitalizeFirstLetter(username);
        const lowerCaseEmail = email.toLowerCase();
        const userId = await this.dbSqlite('users').select('id').where({active: true, email: lowerCaseEmail, username: capitalizedUsername}).first();

        if (!userId) {
            reply.code(201);
            return {status: 'success', message: 'If your username and email was correct, password was sent to your e-mail.'};
        }

        const newPassword = generatePassword(12);
        const hashedPassword = await this.hashPassword(newPassword);

        const result: number = await this.dbSqlite('users').where({
            id: userId.id,
            active: true
        }).update({'password': hashedPassword, 'mfa': false, 'mfa_otp': null});

        if (!result) {
            reply.code(202);
            return {status: 'success', message: 'If your username and email was correct, password was sent to your e-mail.'};
        }

        console.log('-------------------------------------------------------------------------------------');
        console.log('-------------------------------------------------------------------------------------');
        console.log('YOUR NEW PASSWORD CODE: ', newPassword);
        console.log('-------------------------------------------------------------------------------------');
        console.log('-------------------------------------------------------------------------------------');
        await sendEmailResetPassword(email, newPassword); // TODO: uncomment this!!

        reply.code(200);
        return {status: 'success', message: 'If your username and email was correct, password was sent to your e-mail'};

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

export default resetPassword;