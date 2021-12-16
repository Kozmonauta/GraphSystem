{
    "name": "User",
    "definer": "",
    "nodes": {
        "profile": {
            "label": "Profile",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "account": {
            "label": "Account",
            "fields": {
                "email": {
                    "type":"string"
                },
                "password": {
                    "type":"string"
                }
            }
        }
    },
    "edges": {
        "controls": {
            "source": "profile",
            "type": "C"
        },
        "parent": {
            "target": "profile",
            "type": "H"
        },
        "children": {
            "source": "profile",
            "type": "H",
            "multiple": true
        },
        "authentication": {
            "type": "A",
            "source": "account",
            "target": "profile"
        }
    }
}
