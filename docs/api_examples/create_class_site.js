{
    "name": "Site",
    "defines": {
        "id": "9761c1fa-3bf7-408f-9d95-bb6889b61e0a"
    },
    "extends": {
        "id": "9761c1fa-3bf7-408f-9d95-bb6889b61e0a"
    },
    "nodes": {
        "site": {
            "label": "Site",
            "fields": {
                "name": {
                    "type": "text"
                },
                "country": {
                    "type": "text"
                },
                "location": {
                    "type": "text"
                },
                "street": {
                    "type": "text"
                },
                "type": {
                    "type": "text"
                }
            }
        }
    },
    "edges": {
        "parent": {
            "name": "Parent",
            "label": "HAS",
            "direction": "in",
            "required": true
        },
        "company": {
            "name": "Company",
            "label": "USES",
            "direction": "in",
            "pair": {
                "class": {
                    "id": "9761c1fa-3bf7-408f-9d95-bb6889b61e0a"
                }
            }
        },
        "employees": {
            "name": "Company",
            "label": "USES",
            "direction": "in"
        }
    }
}