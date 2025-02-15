export const createResponseSchema = {
    "$id": "schema:game:create:response201",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateSuccess201Response",
    "type": "object",
    "properties": {
        "status": { "type": "string", "enum": ["success"] },
        "data": {
            "type": "object",
            "properties": {
                "game_id": { "type": "string" },
                "created_at": { "type": "string", "format": "date-time" }
            },
            "required": ["game_id", "created_at"]
        }
    },
    "required": ["status", "data"]
} as const