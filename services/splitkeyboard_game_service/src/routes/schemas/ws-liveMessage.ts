export const wsLiveMessageSchema = {
	"$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"properties": {
		"status": { "type": "string", "enum": ["pending", "countdown", "live", "finished"] },
		"countdown": { "type": "number" },
		"playerOne": {
			"type": "object",
			"properties": {
				"username": { "type": "string" },
				"paddle": {
					"type": "object",
					"properties": {
						"yCenter": { "type": "number" },
						"height": { "type": "number" },
						"width": { "type": "number" }
					},
					"required": ["yCenter", "height", "width"]
				},
				"score": { "type": "number" }
			},
			"required": ["username", "paddle", "score"]
		},
		"playerTwo": {
			"type": "object",
			"properties": {
				"username": { "type": "string" },
				"paddle": {
					"type": "object",
					"properties": {
						"yCenter": { "type": "number" },
						"height": { "type": "number" },
						"width": { "type": "number" }
					},
					"required": ["yCenter", "height", "width"]
				},
				"score": { "type": "number" }
			},
			"required": ["username", "paddle", "score"]
		},
		"ball": {
			"type": "object",
			"properties": {
				"x": { "type": "number" },
				"y": { "type": "number" },
				"semidiameter": { "type": "number" }
			},
			"required": ["x", "y", "semidiameter"]
		},
		"timestamp": { "type": "number" }
	},
	"required": [
		"status",
		"playerOne",
		"playerTwo",
		"ball",
		"timestamp"
	]
};