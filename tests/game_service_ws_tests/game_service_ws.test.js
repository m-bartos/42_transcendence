import WebSocket from 'ws'
import {generateRandomEmail, generateRandomString} from "../utils/utils.js";
import {afterAll, expect} from "@jest/globals";

const AUTH_BASE_URL = 'http://localhost/api/auth';
const GAME_BASE_URL = 'http://localhost/api/game';
const GAME_SOCKET_BASE_URL = 'ws://localhost/api/game';
const MATCH_BASE_URL = 'http://localhost/api/game';
const MATCH_SOCKET_BASE_URL = 'ws://localhost/api/match';

let p1username, p1password, p1token, p2username, p2password, p2token, player1wss, player2wss

p1username = 'player1';
p2username = 'player2';

p1password = generateRandomString(10);
p2password = generateRandomString(10);

describe('Game service Web Socket tests', function () {
    beforeAll(async function () {
        const player1Body = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: p1username,
              password: p1password,
              email: generateRandomEmail(3)
            })
        }
        const player2Body = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: p2username,
              password: p2password,
              email: generateRandomEmail(3),
            })
        }
        // create players/users
        const player1Response = await fetch(`${AUTH_BASE_URL}/user`, player1Body);
        expect(player1Response.status).toBe(201);

        const player2Response = await fetch (`${AUTH_BASE_URL}/user`, player2Body);
        expect(player2Response.status).toBe(201);


        // login players/users
        const player1LoginResponse = await fetch (`${AUTH_BASE_URL}/login`, player1Body);
        expect(player1LoginResponse.status).toBe(200);
        const player1LoginPayload = await player1LoginResponse.json();
        expect(player1LoginPayload).toHaveProperty('data');
        p1token = player1LoginPayload.data.token;


        const player2LoginResponse = await fetch (`${AUTH_BASE_URL}/login`, player2Body);
        expect(player2LoginResponse.status).toBe(200);
        const player2LoginPayload = await player2LoginResponse.json();
        expect(player2LoginPayload).toHaveProperty('data');
        p2token = player2LoginPayload.data.token;
    })

    afterAll(async function () {
        // deactivate players/users
        const player1DelResponse = await fetch (`${AUTH_BASE_URL}/user`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${p1token}`,
            }
        });
        expect(player1DelResponse.status).toBe(200);

        const player2DelResponse = await fetch (`${AUTH_BASE_URL}/user`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${p2token}`,
            }
        });
        expect(player2DelResponse.status).toBe(200);

        player1wss.close();
    })


    it('tests match endpoint socket accept connections', async function () {
        let gameId = null;
        let wssUrl1 = `${MATCH_SOCKET_BASE_URL}/ws?playerJWT=${p1token}`;

        function setupWebSocket(url) {
            return new Promise((resolve, reject) => {
                const ws = new WebSocket(url);

                ws.on('open', () => {
                    resolve(ws);
                });

                ws.on('error', (error) => {
                    reject(error);
                });
            });
        }

        // Helper function to wait for a message
        function waitForMessage(ws) {
            return new Promise((resolve) => {
                ws.once('message', (data) => resolve(data.toString()));
            });
        }
        try {
            player1wss = await setupWebSocket(wssUrl1);
            const message = await waitForMessage(player1wss);
            expect(typeof message).toBe('string');
            const parsedMessage = JSON.parse(message);``
            expect(parsedMessage).toEqual({
                status: 'searching',
                gameId: null,
            });
        }
        catch (error) {
            throw error;
        }
    })
})