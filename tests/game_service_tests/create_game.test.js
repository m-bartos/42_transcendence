import { generateRandomString, generateRandomEmail } from '../utils/utils.js';
import * as crypto from "node:crypto";


const AUTH_URL = 'http://localhost/api/auth';
const BASE_URL = 'http://localhost/api/game';
let username, password, email, token;

describe('POST /games - Create new game', () => {
    beforeAll(async () => {
        username = generateRandomString(10);
        password = generateRandomString(12);
        email = generateRandomEmail(10);

        const createResponse = await fetch(`${AUTH_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email }),
        });
        expect(createResponse.status).toBe(201);

        const loginResponse = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const loginPayload = await loginResponse.json();
        expect(loginResponse.status).toBe(200);
        token = loginPayload.data.token;
    });

    afterAll(async () => {
    });

    test('should create successfully - 201', async () => {
        const playerOneSessionId = crypto.randomUUID();
        const playerTwoSessionId = crypto.randomUUID();

        const response = await fetch(`${BASE_URL}/games`, {
            method: 'POST',
            // headers: { 'Authorization': `Bearer ${token}` },
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerOneSessionId, playerTwoSessionId }),
        });
        const payload = await response.json();

        expect(response.status).toBe(201);
        expect(payload.status).toBe('success');
        expect(payload).toHaveProperty('data');
        expect(payload.data).toHaveProperty('gameId');
        expect(payload.data).toHaveProperty('created');
    });

    test('blank body - 4xx', async () => {

        const response = await fetch(`${BASE_URL}/games`, {
            method: 'POST',
            // headers: { 'Authorization': `Bearer ${token}` },
            headers: {
                'Content-Type': 'application/json'
            },
            body: "",
        });

        expect(response.status).toBe(400);
    });

    test('bad format of both player sessionIds - 400', async () => {
        const playerOneSessionId = generateRandomString(10);
        const playerTwoSessionId = generateRandomString(20);

        const response = await fetch(`${BASE_URL}/games`, {
            method: 'POST',
            // headers: { 'Authorization': `Bearer ${token}` },
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerOneSessionId, playerTwoSessionId }),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
    });

    test('bad format of playerOneSessionId - 400', async () => {
        const playerOneSessionId = crypto.randomUUID();
        const playerTwoSessionId = generateRandomString(20);

        const response = await fetch(`${BASE_URL}/games`, {
            method: 'POST',
            // headers: { 'Authorization': `Bearer ${token}` },
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerOneSessionId, playerTwoSessionId }),
        });

        expect(response.status).toBe(400);
    });

    test('bad format of playerTwoSessionId - 400', async () => {
        const playerOneSessionId = generateRandomString(15);
        const playerTwoSessionId = crypto.randomUUID();

        const response = await fetch(`${BASE_URL}/games`, {
            method: 'POST',
            // headers: { 'Authorization': `Bearer ${token}` },
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerOneSessionId, playerTwoSessionId }),
        });

        expect(response.status).toBe(400);
    });
});