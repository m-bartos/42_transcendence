import {generateRandomString, generateRandomEmail} from "./utils.js";
import {jest} from '@jest/globals'

const BASE_URL = "http://localhost/api/auth"


// Custom matcher for email format (basic regex for testing)
expect.extend({
    toBeValidEmail(received) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);
        return {
            message: () => `expected ${received} to be a valid email format`,
            pass,
        };
    },
});


describe("Testing CREATE USER endpoint", function() {
    test('POST /user - valid request body, return 201', async function() {
        const requestBody = {
            username: generateRandomString(5), // Longer than minLength: 3
            email: generateRandomEmail(5),
            password: generateRandomString(10), // Longer than minLength: 8
        };
        const response = await fetch(BASE_URL + "/user", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        const payload = await response.json();

        // Status and headers
        expect(response.status).toBe(201);
        expect(response.headers.get('content-type')).toMatch(/json/);

        // Response schema validation (UserCreateSuccess201Response)
        expect(payload).toHaveProperty('status', 'success');
        expect(payload).toHaveProperty('message');
        expect(typeof payload.message).toBe('string');
        expect(payload).toHaveProperty('data');
        expect(typeof payload.data).toBe('object');

        // Data properties
        expect(payload.data).toHaveProperty('id');
        expect(typeof payload.data.id).toBe('number');
        expect(payload.data.id).toBeGreaterThan(0);
        expect(payload.data).toHaveProperty('username', requestBody.username);
        expect(payload.data).toHaveProperty('email', requestBody.email);
        expect(payload.data.email).toBeValidEmail();

        // No unexpected properties
        expect(Object.keys(payload)).toHaveLength(3); // status, message, data
        expect(Object.keys(payload.data)).toHaveLength(3); // id, username, email
    })
    // Bad Request Cases (400)
    test('missing username returns 400', async () => {
        const requestBody = {
            email: generateRandomEmail(5),
            password: generateRandomString(8),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(typeof payload.message).toBe('string');
        expect(payload.message.toLowerCase()).toMatch(/username/); // Error mentions username
    });

    test('missing email returns 400', async () => {
        const requestBody = {
            username: generateRandomString(3),
            password: generateRandomString(8),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(payload.message.toLowerCase()).toMatch(/email/);
    });

    test('missing password returns 400', async () => {
        const requestBody = {
            username: generateRandomString(3),
            email: generateRandomEmail(5),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(payload.message.toLowerCase()).toMatch(/password/);
    });

    test('username too short returns 400', async () => {
        const requestBody = {
            username: 'ab', // minLength: 3
            email: generateRandomEmail(5),
            password: generateRandomString(8),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(payload.message.toLowerCase()).toMatch(/username/);
    });

    test('password too short returns 400', async () => {
        const requestBody = {
            username: generateRandomString(3),
            email: generateRandomEmail(5),
            password: generateRandomString(7), // minLength: 8
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(payload.message.toLowerCase()).toMatch(/password/);
    });

    test('invalid email format returns 400', async () => {
        const requestBody = {
            username: generateRandomString(3),
            email: 'not-an-email', // Invalid format
            password: generateRandomString(8),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(payload.message.toLowerCase()).toMatch(/email/);
    });

    test('malformed JSON returns 400', async () => {
        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ "username": "test", "email": "test@example.com", "password": "12345678"', // Missing closing brace
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
    });

    // Conflict Case (409)
    test('duplicate email returns 409', async () => {
        const requestBody = {
            username: generateRandomString(3),
            email: 'existing@example.com', // Assume this email is already in use
            password: generateRandomString(8),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(409);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(payload).toHaveProperty('conflict');
        expect(typeof payload.conflict).toBe('string');
        expect(payload.conflict.toLowerCase()).toMatch(/email/);
    });


    test('minimum length fields succeed with 201', async () => {
        const requestBody = {
            username: generateRandomString(3),
            email: generateRandomEmail(1),
            password: generateRandomString(8),
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(201);
        expect(payload).toHaveProperty('status', 'success');
        expect(payload).toHaveProperty('message');
        expect(payload).toHaveProperty('data');
        expect(payload.data).toHaveProperty('id');
        expect(payload.data.username).toBe(requestBody.username);
        expect(payload.data.email).toBe(requestBody.email);
    });

    test('maximum length fields succeed with 201', async () => {
        const requestBody = {
            username: generateRandomString(32),
            email: generateRandomEmail(60),
            password: generateRandomString(32)
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(201);
        expect(payload).toHaveProperty('status', 'success');
        expect(payload).toHaveProperty('message');
        expect(payload).toHaveProperty('data');
        expect(payload.data).toHaveProperty('id');
        expect(payload.data.username).toBe(requestBody.username);
        expect(payload.data.email).toBe(requestBody.email);
    });

    test('out of bounds field length fail with 400', async () => {
        const requestBody = {
            username: generateRandomString(320),
            email: generateRandomEmail(83),
            password: generateRandomString(320)
        };

        const response = await fetch(`${BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
        expect(typeof payload.message).toBe('string');
    });
})