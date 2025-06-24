import sgMail from '@sendgrid/mail';
import {applySecret} from "./retrieveSecret.js";

sgMail.setApiKey(applySecret("emailApiKey")!);

/**
 * Sends a one-time password (OTP) email to the specified user.
 *
 * @param {string} to - Recipient email address.
 * @param {string} otp - One-time password string.
 * @returns {Promise<void>}
 */
export async function sendEmailOtp(to: string, otp: string) {
    const msg = {
        to,
        from: 'no-reply@aidemo.cz', // Must be verified in SendGrid
        subject: 'PONG - Your OTP MFA Code',
        text: `Your one-time MFA password is: ${otp}`,
        html: `<strong>Your one-time password is: ${otp}</strong>`,
    };

    await sgMail.send(msg);
}

export async function sendEmailResetPassword(to: string, otp: string) {
    const msg = {
        to,
        from: 'no-reply@aidemo.cz', // Must be verified in SendGrid
        subject: 'PONG - Your new password',
        text: `Your password was reset. New password is: ${otp}`,
        html: `<strong>Your password was reset. New password is: ${otp}</strong>`,
    };

    await sgMail.send(msg);
}