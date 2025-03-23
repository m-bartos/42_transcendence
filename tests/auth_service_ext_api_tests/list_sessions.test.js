import { generateRandomString, generateRandomEmail } from './utils.js';

const BASE_URL = 'http://localhost/api/auth';
let username, password, email, token;

describe('GET /sessions - List Sessions', () => {
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
            const deleteResponse = await fetch(`${BASE_URL}/user`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            expect(deleteResponse.status).toBe(200);
        } else {
            console.log('No token available for cleanup; skipping DELETE.');
        }
    });

    test('should list sessions successfully - 200', async () => {
        const response = await fetch(`${BASE_URL}/sessions`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.status).toBe('success');
        expect(payload).toHaveProperty('message');
        expect(payload).toHaveProperty('count');
        expect(Array.isArray(payload.data)).toBe(true);
        if (payload.data.length > 0) {
            expect(payload.data[0]).toHaveProperty('session_id');
            expect(payload.data[0]).toHaveProperty('user_id');
            expect(payload.data[0]).toHaveProperty('created_at');
            expect(payload.data[0]).toHaveProperty('revoked');
        }
    });

    test('should return 401 for invalid token', async () => {
        const response = await fetch(`${BASE_URL}/sessions`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalid_token' },
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });
});