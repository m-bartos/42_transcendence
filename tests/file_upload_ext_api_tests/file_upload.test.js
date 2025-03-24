import { generateRandomString, generateRandomEmail } from '../utils/utils.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const BASE_URL = 'http://localhost/api';
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

describe('POST /user/internal/avatar - check upload service', () => {
    beforeAll(async () => {
        username = generateRandomString(20);
        password = generateRandomString(20);
        email = generateRandomEmail(10);

        const createResponse = await fetch(`${BASE_URL}/auth/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email }),
        });
        expect(createResponse.status).toBe(201);

        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
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
            const deleteResponse = await fetch(`${BASE_URL}/auth/user`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            expect(deleteResponse.status).toBe(200);
        } else {
            console.log('No token available for cleanup; skipping DELETE.');
        }
    });

    test('should not be authorized 401', async () => {
        const response = await fetch(`${BASE_URL}/upload/avatar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: 'avatar.jpg', sessionId }),
        });
        const payload = await response.json();
        expect(response.status).toBe(401);
        expect(payload.status).toBe('error');
        expect(payload).toHaveProperty('message');
    });

    test('uploads a file with form-data and returns 200', async () => {
        const filePath = path.resolve('./assets/fullballness.png');
        const fileStreamForUpload = fs.createReadStream(filePath);
        const form = new FormData();
        form.append('upload', fileStreamForUpload, {
            filename: 'fullballness.png',
            contentType: 'image/png',
        });
        const response = await axios.post(`${BASE_URL}/upload/avatar`, form, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
        });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'success');
        expect(response.data).toHaveProperty('message');
    }, 20000);


    test('upload a file with wrong field name 400', async () => {
        const filePath = path.resolve('./assets/fullballness.png');
        const fileStreamForUpload = fs.createReadStream(filePath);
        const form = new FormData();
        form.append('uploads', fileStreamForUpload, {
            filename: 'fullballness.png',
            contentType: 'image/png',
        });
        form.append('test', 'asfasfasfasfa');
        const response = await fetch(`${BASE_URL}/upload/avatar`, {
            method: 'POST',
            body: form,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            }
        })
        const payload = await response.json();
        expect(response.status).toBe(400);
        expect(payload).toHaveProperty('status', 'error');
        expect(payload).toHaveProperty('message');
    });

});
// TODO
// What other things to check?

// 1) test update of image - compare filenames between get/user/info and upload
// 2) test the old image was deleted form the storage after update
// 3) test uploading file with over 1MB size => 413