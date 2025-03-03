export const getResponseSchema = {
    "$id": "schema:game:get:response201",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameGetSuccess201Response",
    "type": "object",
    "properties": {
        "status": { "type": "string", "enum": ["success"] },
        "data": {
            "type": "object",
            "properties": {
                "games": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "gameId": { "type": "string" },
                            "status": { "type": "string",  "enum": ["pending", "countdown", "playing", "finished"] },
                            "playerOneUsername": { "type": "string" },
                            "playerTwoUsername": { "type": "string" },
                            "playerOneScore": { "type": "number" },
                            "playerTwoScore": { "type": "number" },
                            "created": { "type": "string", "format": "date-time" }
                        },
                        "required": ["gameId", "status", "playerOneUsername", "playerTwoUsername", "created"]
                    }
                }
            },
            "required": ["games"]
        },
    },
    "required": ["status", "data"]
} as const