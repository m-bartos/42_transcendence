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

describe('POST /user/internal/avatar - Update Avatar Link (Internal API)', () => {
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
            // It has to be 500 as there is no actual file to be deleted!!!
            expect(deleteResponse.status).toBe(500);
        } else {
            console.log('No token available for cleanup; skipping DELETE.');
        }
    });

    test('should update avatar link successfully - 200', async () => {
        const response = await fetch(`${BASE_URL_INTERNAL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: 'avatar.jpg', sessionId }),
        });
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.status).toBe('success');
        expect(payload).toHaveProperty('message');
        // Data is optional, only present if avatar was previously set
        if (payload.data) {
            expect(payload.data).toHaveProperty('avatar');
        }
    });

    test('should return 400 for missing fields', async () => {
        const response = await fetch(`${BASE_URL_INTERNAL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Missing filePath and sessionId
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });

    test('should return 401 for invalid sessionId', async () => {
        const response = await fetch(`${BASE_URL_INTERNAL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: 'avatar.jpg', sessionId: 'invalid_session' }),
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });
});