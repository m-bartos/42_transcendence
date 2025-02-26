export const wsLiveMessageSchema = {
	"$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"properties": {
	  "status": { "type": "string", "enum": ["pending", "live", "finished"] },
	  "paddleOne": {
		"type": "object",
		"properties": {
		  "yCenter": { "type": "number" },
		  "height": { "type": "number" },
		  "width": { "type": "number" }
		},
		"required": [
		  "yCenter",
		  "height",
		  "width"
		]
	  },
	  "paddleTwo": {
		"type": "object",
		"properties": {
		  "yCenter": { "type": "number" },
		  "height": { "type": "number" },
		  "width": { "type": "number" }
		},
		"required": [
		  "yCenter",
		  "height",
		  "width"
		]
	  },
	  "ball": {
		"type": "object",
		"properties": {
		  "x": { "type": "number" },
		  "y": { "type": "number" },
		  "semidiameter": { "type": "number" }
		},
		"required": [
		  "x",
		  "y",
		  "semidiameter"
		]
	  },
	  "playerOneScore": {
		"type": "integer"
	  },
	  "playerTwoScore": {
		"type": "integer"
	  },
	  "timestamp": {
		"type": "integer"
	  }
	},
	"required": [
	  "status",
	  "paddleOne",
	  "paddleTwo",
	  "ball",
	  "playerOneScore",
	  "playerTwoScore",
	  "timestamp"
	]
  }