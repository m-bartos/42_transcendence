import { generateRandomString, generateRandomEmail } from './utils.js';

const BASE_URL = 'http://localhost/api/auth';
let username, password, email, token, newToken;

describe('PATCH /user/password - Change Password', () => {
    beforeAll(async () => {
        username = generateRandomString(10);
        password = generateRandomString(12);
        email = generateRandomEmail(10);

        const createResponse = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email }),
        });
        expect(createResponse.status).toBe(201);

        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const loginPayload = await loginResponse.json();
        expect(loginResponse.status).toBe(200);
        token = loginPayload.data.token;
    });

    afterAll(async () => {
        if (newToken) {
            const deleteResponse = await fetch(`${BASE_URL}/user`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${newToken}` },
            });
            expect(deleteResponse.status).toBe(200);
        } else {
            console.log('No token available for cleanup; skipping DELETE.');
        }
    });

    test('should change password successfully and invalidate sessions - 200', async () => {
        const newPassword = generateRandomString(12);
        const changeResponse = await fetch(`${BASE_URL}/user/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password, newPassword }),
        });
        const changePayload = await changeResponse.json();

        expect(changeResponse.status).toBe(200);
        expect(changePayload.status).toBe('success');
        expect(changePayload).toHaveProperty('message');

        // Verify old token is invalidated
        const infoResponseOldToken = await fetch(`${BASE_URL}/user/info`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        expect(infoResponseOldToken.status).toBe(401);

        // Log in with new password
        const loginResponseNew = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: newPassword }),
        });
        const loginPayloadNew = await loginResponseNew.json();
        expect(loginResponseNew.status).toBe(200);
        newToken = loginPayloadNew.data.token;

        // Verify new token works
        const infoResponseNewToken = await fetch(`${BASE_URL}/user/info`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${newToken}` },
        });
        expect(infoResponseNewToken.status).toBe(200);
    });

    test('should return 400 for invalid input', async () => {
        const response = await fetch(`${BASE_URL}/user/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password, newPassword: 'abc' }), // Too short
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });

    test('should return 401 for invalid token', async () => {
        const newPassword = generateRandomString(12);
        const response = await fetch(`${BASE_URL}/user/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token',
            },
            body: JSON.stringify({ password, newPassword }),
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });
});