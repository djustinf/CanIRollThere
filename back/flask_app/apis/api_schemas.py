route_schema = {
    "type": "object",
    "properties": {
        "locations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "lat": { "type": "number" },
                    "lng": { "type": "number" }
                },
                "required": ["lat", "lng"]
            },
            "minItems": 1
        }
    },
    "required": ["locations"]
}

user_schema = {
    "type": "object",
    "properties": {
        "username": {
            "type": "string",
        },
        "password": {
            "type": "string",
        }
    },
    "required": ["username", "password"]
}
