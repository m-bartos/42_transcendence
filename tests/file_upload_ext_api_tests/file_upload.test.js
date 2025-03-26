import { generateRandomString, generateRandomEmail } from '../utils/utils.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Docker from "dockerode";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import {extractJtiFromToken} from "../utils/utils.js";

const BASE_URL = 'http://localhost/api';

let username, password, email, token, sessionId;



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
    },15000);

    it('should not be authorized 401', async () => {
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

    it('uploads a valid file with form-data and returns 200', async () => {
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


    it('uploads a file with wrong field name 400', async () => {
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


    it('uploads a file with auth_service off, returns 500', async () => {
        const docker = new Docker();
        const network = docker.getNetwork("services_transcendence");

        // Disconnect auth_service from the network
        await network.disconnect({
            Container: "auth_service",
            Force: true,
        });
        const filePath = path.resolve('./assets/fullballness.png');
        const fileStreamForUpload = fs.createReadStream(filePath);
        const form = new FormData();
        form.append('upload', fileStreamForUpload, {
            filename: 'fullballness.png',
            contentType: 'image/png',
        });

        let response;
        try {
            response = await axios.post(`${BASE_URL}/upload/avatar`, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                },
            });
        } catch (error) {
            response = error.response; // Capture the error response
        }

        // Reconnect auth_service to the network
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await network.connect({
            Container: "auth_service",
            Force: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(response.status).toBe(500);
        expect(response.data).toHaveProperty('status', 'error');
        expect(response.data).toHaveProperty('message');
    }, 30000);



});

// TODO
// What other things to check?

// 1) test update of image - compare filenames between get/user/info and upload
// 2) test the old image was deleted form the storage after update
// 3) test uploading file with over 1MB size => 413