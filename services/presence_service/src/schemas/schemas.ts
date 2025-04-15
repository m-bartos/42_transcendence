const GetOnlineUsersSuccess200Response = {
    $id: 'https://ponggame.com/schemas/api/v1/presence/getOnlineUsers/response-200.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GetOnlineUsersSuccess200Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['success'] },
        message: { type: 'string' },
        data: {
            type: 'array',
            items: { type: 'integer' },
        }
    },
    required: ['status', 'message', 'data'],
};

const GetOnlineUsersServerError500Response = {
    $id: 'https://ponggame.com/schemas/api/v1/presence/getOnlineUsers/response-500.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GetOnlineUsersServerError500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' }
    },
    required: ['status', 'message'],
};

export const schemas = [
    GetOnlineUsersSuccess200Response,
    GetOnlineUsersServerError500Response,
]