{
    "name": "User",
    "edges": {
        "parent": {
            "name": "parent",
            "export": "true",
            "filter": "true",
            "required": "true",
            "list": "true",
            "label": "HAS",
            "multiple": "false",
            "target": "Profile"
        },
        "account": {
            "name": "account",
            "export": "true",
            "filter": "true",
            "required": "true",
            "list": "true",
            "label": "AUTHENTICATES",
            "multiple": "false",
            "target": "Profile",
            "source": "Account",
            "showOn": "target"
        },
        "personal": {
            "name": "personal",
            "export": "false",
            "filter": "true",
            "required": "true",
            "list": "true",
            "label": "PERSONALIZES",
            "multiple": "false",
            "target": "Profile",
            "source": "Person",
            "showOn": "target"
        },
        "folders": {
            "name": "folders",
            "export": "false",
            "filter": "false",
            "required": "false",
            "list": "false",
            "label": "USES_FOLDERS",
            "multiple": "false",
            "source": "Profile",
            "target": "Folders",
            "showOn": "source"
        },
        "controls": {
            "name": "controls",
            "export": "false",
            "filter": "false",
            "required": "false",
            "list": "false",
            "label": "CONTROLS",
            "multiple": "true",
            "source": "Profile",
            "target": {
                "class": {
                    "id": "*"
                }
            }
        }
    },
    "nodes": {
        "Profile": {
            "name": "Profile",
            "properties": {
                "name": {
                    "name": "name",
                    "type": "text",
                    "export": "true",
                    "filter": "true",
                    "required": "true",
                    "list": "true",
                    "textType": "general",
                    "rules": ""
                },
                "actions": {
                    "name": "actions",
                    "type": "special",
                    "export": "false",
                    "filter": "true",
                    "required": "true",
                    "list": "false",
                    "specialType": "actions",
                    "rules": ""
                }
            },
            "type": "core",
            "showIf": ""
        },
        "Account": {
            "name": "Account",
            "properties": {
                "email": {
                    "name": "email",
                    "type": "text",
                    "export": "true",
                    "filter": "true",
                    "required": "true",
                    "list": "true",
                    "textType": "email",
                    "rules": ""
                },
                "password": {
                    "name": "password",
                    "type": "text",
                    "export": "false",
                    "filter": "false",
                    "required": "true",
                    "list": "false",
                    "textType": "password",
                    "rules": ""
                }
            },
            "showIf": ""
        },
        "Person": {
            "name": "Person",
            "properties": {
                "firstname": {
                    "name": "firstname",
                    "type": "text",
                    "export": "false",
                    "filter": "false",
                    "required": "false",
                    "list": "false",
                    "textType": "general",
                    "rules": ""
                },
                "lastname": {
                    "name": "lastname",
                    "type": "text",
                    "export": "false",
                    "filter": "false",
                    "required": "false",
                    "list": "false",
                    "textType": "general",
                    "rules": ""
                }
            },
            "showIf": ""
        },
        "Folders": {
            "name": "Folders",
            "properties": {
                "items": {
                    "name": "items",
                    "type": "text",
                    "export": "false",
                    "filter": "false",
                    "required": "false",
                    "list": "false",
                    "textType": "general",
                    "rules": ""
                }
            },
            "showIf": "false=true"
        }
    }
}