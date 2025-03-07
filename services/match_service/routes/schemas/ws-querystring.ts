export const wsQuerySchema = {
    "$id": "schema:matchmaking:ws:query",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "MatchmakingWsQuerySchema",
    "type": "object",
    "properties": {
		  "playerJWT": { "type": "string" }
		},
		"required": ["playerJWT"]
} as const