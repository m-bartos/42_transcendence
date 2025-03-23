import { generateRandomString, generateRandomEmail } from './utils.js';

const BASE_URL = 'http://localhost/api/auth';
const BASE_URL_INTERNAL = 'http://localhost:3000/user/internal/avatar';

let username, password, email, token, sessionId;

// Helper function to extract jti (sessionId) from JWT token
function extractJtiFromToken(token) {
    try {
        const payload = token.split('.')[1];
        const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
        const claims = JSON.parse(decodedPayload);
        return claims.jti;
    } catch (error) {
        console.error('Error extracting jti from token:', error);
        throw error;
    }
}

describe('POST /user/internal/avatar - check that internal api is not reachable from outside', () => {
    beforeAll(async () => {
        username = generateRandomString(20);
        password = generateRandomString(20);
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
        sessionId = extractJtiFromToken(token); // Extract sessionId from JWT
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

    test('should not find the resource 404', async () => {
        const response = await fetch(`${BASE_URL}/internal/avatar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: 'avatar.jpg', sessionId }),
        });
        const payload = await response.json();
        expect(response.status).toBe(404);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });

});