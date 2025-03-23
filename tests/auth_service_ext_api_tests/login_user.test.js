import {generateRandomString, generateRandomEmail, createUser} from "./utils.js";

const BASE_URL = "http://localhost/api/auth"
const username = generateRandomString(10);
const password = generateRandomString(12);
const email = generateRandomEmail(4);
let token = null;

describe("LOGIN USER tests", () => {

    beforeAll(async () => {
        const createResponse = await fetch(BASE_URL + '/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email
            })
        })
        const payload = await createResponse.json();
        expect(createResponse.status).toBe(201);
        expect(payload.data).toHaveProperty('id');
    })


    afterAll(async () => {
        if (token)
        {
            const deleteResponse = await fetch(BASE_URL + '/user', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const payload = await deleteResponse.json();
            expect(deleteResponse.status).toBe(200);
            expect(payload).toHaveProperty('status');
            expect(payload).toHaveProperty('message');
        }
        else
        {
            console.log('No token available for cleanup; skipping DELETE.');
        }
    })

    test("login user, should be valid, returns 200", async () => {
        const requestBody = {
            'username': username,
            'password': password
        }
        const response = await fetch(BASE_URL + '/login', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const payload = await response.json();
        expect(response.status).toBe(200);
        expect(payload.status).toBe('success');
        expect(payload.message).toBe("user logged in");
        expect(typeof payload.data).toBe('object');
        expect(typeof payload.data.token).toBe('string')
        expect(payload.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
        token = payload.data.token;
    })

    test('login user, invalid password returns 401', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: 'wrongpassword',
            }),
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message).toMatch(/invalid username or password/i);
    });

    test('login user, non-existent username returns 401', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'nonexistent',
                password: password,
            }),
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload).toHaveProperty('status','error');
        expect(payload.message).toMatch(/invalid username or password/i);
    });

    test('login user, missing password returns 400', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
            }),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message.toLowerCase()).toMatch(/password/);
    });

    test('login user, additional and extra large field in request body 413', async() => {
        const dummy_field = generateRandomString(1500000);
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                dummy_field: dummy_field, // 1.5MB
            })
        })
        const payload = await response.json();
        expect(response.status).toBe(413);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message.toLowerCase()).toMatch(/request body is too large/i);
    }, 50000)

    test('login user, short username returns 400', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "po",
                password: password,
            })
        })
        const payload = await response.json();
        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message.toLowerCase()).toMatch(/username/);
    })

    test('login user, short password returns 400', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: "123",
            })
        })
        const payload = await response.json();
        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message.toLowerCase()).toMatch(/password/);
    })
    // Body content is filtered by schema validation -- all fields cleaned if the schema
    // contains additionalProperties: false
    test('login user, additional field in request body 200', async() => {
        const dummy_field = generateRandomString(15);
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                dummy_field: dummy_field,
            })
        })
        const payload = await response.json();
        expect(response.status).toBe(200);
        expect(payload).toHaveProperty('status', 'success');
        expect(payload).toHaveProperty('message');
    })

    test('login user, long password returns 400', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: generateRandomString(100),
            })
        })
        const payload = await response.json();
        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message.toLowerCase()).toMatch(/password/);
    })

    test('login user, long username returns 400', async () => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: generateRandomString(100),
                password: password
            })
        })
        const payload = await response.json();
        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message.toLowerCase()).toMatch(/username/);
    })
})
