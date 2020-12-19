{
    "name": "Felhasználó",
    "label": "Profile",
    "container": {
        "id": 1
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
                "minLength": 3,
                "maxLength": 30
            },
            "name": "Teljes név",
            "help": "Vezeték és keresztnév"
        },
        "actions": {
            "type": "actions",
            "name": "Jogosultságok"
        },
        "email": {
            "type": "authEmail",
            "name": "E-mail cím a belépéshez"
        },
        "password": {
            "type": "authPassword",
            "name": "Jelszó"
        }
    },
    "connections": {
        "parent": {
            "name": "Szülő elem",
            "label": "HAS",
            "direction": "in",
            "connected": {
                "classId": 1,
                "label": ""
            }
        },
        "controls": {
            "name": "Kapcsolódó objektum",
            "label": "CONTROLS",
            "direction": "out",
            "connected": {
                "classId": null
            }
        },
        "role": {
            "name": "Munkakör",
            "label": "WORKS",
            "direction": "out",
            "connected": {
                "classId": 1
            }
        },
        "events": {
            "name": "Események",
            "label": "REPORTED",
            "direction": "out",
            "multiple": true,
            "connected": {
                "classId": 1
            }
        }
    },
    "form": ["$fields.name", "$fields.actions", "$fields.email", "$fields.password"],
    "list": ["$fields.name", "$fields.email", "$fields.actions"],
    "filter": ["$fields.name", "$fields.email", "$fields.actions"]
}