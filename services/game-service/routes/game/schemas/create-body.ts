export const createBodySchema = {
    "$id": "schema:game:create:body",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateBody",
    "type": "object",
    "properties": {
        "playerOneId": { "type": "string" },
        "playerTwoId": { "type": "string" }
    },
    "required": ["playerOneId", "playerTwoId"]
} as const;