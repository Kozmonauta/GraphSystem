{
    "Object": {
        "container": "$Core",
        "data": {
            "properties": {
                "id": {
                    "type": "string",
                    "format": "uuid"
                }
            }
        }
    },
    "Profile": {
        "container": "$Core",
        "parent": "$Object",
        "data": {
            "type": "attached",
            "connections": {
                "parent": {
                    "label": "HAS",
                    "direction": "in"
                },
                "children": {
                    "label": "HAS",
                    "direction": "out",
                    "multiple": true
                }
            }
        }
    }
}
