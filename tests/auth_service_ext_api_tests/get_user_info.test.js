import {generateRandomString, generateRandomEmail, createUser} from "./utils.js";

const BASE_URL = "http://localhost/api/auth"
const username = generateRandomString(10);
const password = generateRandomString(12);
const email = generateRandomEmail(4);
let token = null;

describe("GET USER INFO tests", () => {

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

    beforeAll(async () => {
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

    test("get user info, should be valid 200", async () => {
        const response = await fetch(BASE_URL + '/user/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const payload = await response.json();
        expect(response.status).toBe(200);
        expect(payload.status).toBe('success');
        expect(payload.message).toBe("user info");
        expect(typeof payload.data).toBe('object');
        expect(typeof payload.data.id).toBe('number');
        expect(typeof payload.data.username).toBe('string');
        expect(typeof payload.data.email).toBe('string');
        expect(typeof payload.data.avatar).toBe('string')
    })

    test('get user info, invalid auth token 401', async () => {
        const response = await fetch(`${BASE_URL}/user/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer some_invalid_token`
            },
        });
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload.message).toMatch(/unauthorized/i);
    });
})
