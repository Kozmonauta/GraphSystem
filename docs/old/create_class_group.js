{
    "name": "Csoport",
    "label": "Group",
    "container": {
        "id": 0
    },
    "fields": {
        "id": {
            "type": "id",
            "mode": "incremental",
            "name": "Azonosító"
        },
        "creator": {
            "type": "creator",
            "name": "Létrehozó személy"
        },
        "createdOn": {
            "type": "dateOfCreation",
            "name": "Létrehozás dátuma"
        },
        "name": {
            "type": "text"
            "required": true,
            "rules": {
                "minLength": 1,
                "maxLength": 100
            },
            "name": "Megnevezés"
        },
        "number": {
            "type": "text"
            "required": true,
            "rules": {
                "minLength": 5,
                "maxLength": 50
            },
            "name": "Kódszám"
        },
        "address": {
            "type": "address",
            "name": "Cím"
        }
    },
    "connections": {
        "parent": {
            "name": "Szülő elem",
            "label": "HAS",
            "direction": "in",
            "connected": {
                "classId": 1
            }
        },
        "children": {
            "name": "Alárendeltek",
            "label": "HAS",
            "multiple": true,
            "direction": "out",
            "connected": {
                "classId": ""
            }
        }
    },
    "form": ["$fields.name", "$fields.number", "$fields.address", "$connections.parent"],
    "list": ["$fields.name", "$fields.number"],
    "filter": ["$fields.name", "$fields.number", "$connections.parent"]
}