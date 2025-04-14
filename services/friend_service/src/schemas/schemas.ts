
const AddFriendBodySchema = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/add/body.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AddFriendBody',
    type: 'object',
    properties: {
        friendId: {type: 'integer'}
    },
    required: ['friendId'],
    additionalProperties: false,
}

const AddFriendSuccess201Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/add/response-201.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AddFriendSuccess201Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['success'] },
        message: { type: 'string' },
        data: {
            type: 'object',
            properties: {
                user_id: { type: 'integer' },
                friend_id: { type: 'integer' },
                online_status: { type: 'string', enum: ['offline', 'online'] },
                created_at: { type: 'string', format: 'date-time' },
            },
            required: ['user_id', 'friend_id', 'online_status', 'created_at'],
        },
    },
    required: ['status', 'message', 'data'],
}

const AddFriendBadRequest400Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/add/response-400.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AddFriendBadRequest400Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const AddFriendServerError500Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/add/response-500.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AddFriendServerError500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const GetAllFriendsSuccess200Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/get/response-200.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GetAllFriendsSuccess200Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['success'] },
        message: { type: 'string' },
        data: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    user_id: { type: 'integer' },
                    friend_id: { type: 'integer' },
                    online_status: { type: 'string', enum: ['offline', 'online'] },
                    created_at: { type: 'string', format: 'date-time' },
                },
                required: ['user_id', 'friend_id', 'online_status', 'created_at'],
            },
        },
    },
    required: ['status', 'message', 'data'],
};

const GetAllFriendsBadRequest400Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/get/response-400.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GetAllFriendsBadRequest400Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const GetAllFriendsServerError500Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/get/response-500.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GetAllFriendsServerError500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const RemoveFriendBodySchema = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/remove/body.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'RemoveFriendBody',
    type: 'object',
    properties: {
        friend_id: { type: 'integer' }
    },
    required: ['friend_id'],
    additionalProperties: false,
};

const RemoveFriendSuccess200Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/remove/response-200.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'RemoveFriendSuccess200Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['success'] },
        message: { type: 'string' },
        data: {
            type: 'object',
            properties: {
                friend_id: { type: 'integer' },
            },
            required: ['friend_id'],
        },
    },
    required: ['status', 'message', 'data'],
};

const RemoveFriendBadRequest400Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/remove/response-400.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'RemoveFriendBadRequest400Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const RemoveFriendNotFound404Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/remove/response-404.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'RemoveFriendNotFound404Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
        not_found: { type: 'string' },
    },
    required: ['status', 'message', 'not_found'],
};

const RemoveFriendServerError500Response = {
    $id: 'https://ponggame.com/schemas/api/v1/friend/remove/response-500.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'RemoveFriendServerError500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' }
    },
    required: ['status', 'message'],
};

export const schemas = [
    AddFriendBodySchema,
    AddFriendSuccess201Response,
    AddFriendBadRequest400Response,
    AddFriendServerError500Response,
    GetAllFriendsSuccess200Response,
    GetAllFriendsBadRequest400Response,
    GetAllFriendsServerError500Response,
    RemoveFriendBodySchema,
    RemoveFriendSuccess200Response,
    RemoveFriendBadRequest400Response,
    RemoveFriendNotFound404Response,
    RemoveFriendServerError500Response,
]
