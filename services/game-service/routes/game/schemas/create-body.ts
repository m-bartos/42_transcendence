export const createBodySchema = {
    "$id": "schema:game:create:body",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateBody",
    "type": "object",
    "properties": {
        "playerOneSessionId": { "type": "string" },
        "playerTwoSessionId": { "type": "string" }
    },
    "required": ["playerOneSessionId", "playerTwoSessionId"]
} as const;