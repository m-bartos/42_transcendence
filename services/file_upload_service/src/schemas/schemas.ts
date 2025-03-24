
const FileUploadSuccess200Response = {
    $id: 'https://ponggame.com/schemas/api/v1/upload/post/response-200.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AvatarPostSuccess200Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['success'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const FileUploadBadRequest400Response = {
    $id: 'https://ponggame.com/schemas/api/v1/upload/post/response-400.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AvatarPostBadRequest400Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const FileUploadUnauthorized401Response = {
    $id: 'https://ponggame.com/schemas/api/v1/upload/post/response-401.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AvatarPostUnauthorized401Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

const FileUploadServerError500Response = {
    $id: 'https://ponggame.com/schemas/api/v1/upload/post/response-500.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AvatarPostServerError500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['success'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

export default {
    FileUploadSuccess200Response,
    FileUploadBadRequest400Response,
    FileUploadUnauthorized401Response,
    FileUploadServerError500Response
}