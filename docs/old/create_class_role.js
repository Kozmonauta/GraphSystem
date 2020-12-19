{
    "name": "Szerepkör",
    "label": "Role",
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
        "profiles": {
            "name": "Felhasználók",
            "label": "WORKS",
            "multiple": true,
            "direction": "in",
            "connected": {
                "classId": "1"
            }
        }
    },
    "form": ["$fields.name"],
    "list": ["$fields.name", "$fields.profiles"],
    "filter": ["$fields.name"]
}