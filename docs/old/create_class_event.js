{
    "name": "Esemény",
    "label": "Event",
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
            "name": "Létrehozás dátuma",
            "default": "$now"
        },
        "time": {
            "type": "dateTime",
            "required": true,
            "name": "Esemény időpontja",
            "format": "yyyy.mm.dd hh:ii",
            "default": "$now"
        },
        "summary": {
            "type": "text",
            "required": true,
            "name": "Summary"
        },
        "q2": {
            "type": "checkbox",
            "required": true,
            "name": "2. kérdés"
        }
    },
    "connections": {
        "reporter": {
            "name": "Jelentő",
            "label": "REPORTED",
            "required": true,
            "direction": "in",
            "connected": {
                "classId": 1
            }
        },
        "parent": {
            "name": "Projekt",
            "label": "OCCURED",
            "required": true,
            "direction": "in",
            "connected": {
                "classId": 1
            }
        },
        "children": {
            "name": "Következmények",
            "label": "HAS",
            "multiple": true,
            "direction": "out",
            "connected": {
                "classId": 1
            }
        }
    },
    "form": {
        "pages": [
            {
                "name": "Alapadatok",
                "description": "Ez+az",
                "fields": [
                    {
                        "key": "$connections.reporter",
                        "default": "$sip"
                    }, 
                    {
                        "key": "$fields.summary"
                    }
                ]
            },
            {
                "name": "2. oldal",
                "fields": [
                    {
                        "key": "$connections.parent",
                        "default": "$sig"
                    }, 
                    {
                        "key": "$fields.time",
                        "name": "Ekkor történt az esemény"
                    }
                ]
            }
        ]
    },
    "list": {
        "fields": [
            {
                "key": "$fields.summary",
                "name": "Mi történt?"
            },
            {
                "key": "$fields.time",
                "name": "Időpont"
            },
            {
                "key": "$connections.reporter.$fields.name",
                "name": "Rögzítő személy",
                "aggregation": "count"
            },
            {
                "key": "$connections.reporter.$connections.role.$fields.name",
                "name": "Rögzítő személy munkaköre"
            }
        ],
        "sort": ["+$fields.name"]
    },
    "filter": ["$fields.time", "$connections.reporter", "$connections.reporter.$connections.role", "$connections.parent"]
}