import { generateRandomString, generateRandomEmail } from './utils.js';

const BASE_URL = 'http://localhost/api/auth';
let username, password, email, token;

describe('DELETE /sessions/logout/all - Logout All Sessions', () => {
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
        if (token) {
            const loginResponse = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const loginPayload = await loginResponse.json();
            const newToken = loginPayload.data.token;

            const deleteResponse = await fetch(`${BASE_URL}/user`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${newToken}` },
            });
            expect(deleteResponse.status).toBe(200);
        } else {
            console.log('No token available for cleanup; skipping DELETE.');
        }
    });

    test('should logout all sessions successfully - 200', async () => {
        const response = await fetch(`${BASE_URL}/sessions/logout/all`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.status).toBe('success');
        expect(payload).toHaveProperty('message');
    });

    test('should return 401 for invalid token', async () => {
        const response = await fetch(`${BASE_URL}/sessions/logout/all`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer invalid_token' },
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });
});