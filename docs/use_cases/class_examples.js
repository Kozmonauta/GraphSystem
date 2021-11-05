POST /classes

Examples
--------

{
    "name": "User",
    "labels": ["User"],
    "definer": "3aee394b-7ae9-4c83-a6b5-83f98592738d",
    "extends": "Core.Profile",
    "nodes": {
        "user": {
            "label": "User",
            "fields": {
                "name": {
                    "type": "string",
                    "required": true
                }
            }
        },
    },
    "edges": {
        "authenticator": {
            "type": "A",
            "direction": "in",
            "multiple": true,
            "required": true
        }
    },
    "events": {
        "createSuccess": [
            {
                "action": "createObject",
                "parameters": {
                    "class": "Account"
                }
            }
        ]
    }
}

{
    "name": "User",
    "labels": ["User"],
    "definer": "3aee394b-7ae9-4c83-a6b5-83f98592738d",
    "extends": "f3f851c3-14d6-4809-ae02-1becc011ff89",
    "fields": {
        "name": {
            "type": "string",
            "required": true
        }
    },
    "edges": {
        "authenticator": {
            "type": "A",
            "direction": "in",
            "multiple": true,
            "required": true
        }
    },
    "events": {
        "createSuccess": [
            {
                "action": "createObject",
                "parameters": {
                    "class": "Account"
                }
            }
        ]
    }
}