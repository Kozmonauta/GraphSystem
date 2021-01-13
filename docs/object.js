POST /object
request body:
{
    "classID": "2ff4d122-e89b-12d3-a456-426614174000",
    "fields": {
        "name": "Adam",
        "actions": ["c_Project", "r_Project", "u_Project", "d_Project"]
    },
    "edges": {
        "controls": {
            "ID": "123e4567-e89b-12d3-a456-426614174000",
            "label": "Project"
        },
        "authenticators": [{
            "classID": "38ea747e-e89b-12d3-a456-426614174000",
            "fields": {
                "email": "adam@graphsystem.io",
                "password": "asdf1234"
            },
            "edges": {
                "authenticates": "$this"
            }
        }]
    }
}

GET /object/3ff4d122-e89b-12d3-a456-426614174000
response body:
{
    "ID": "3ff4d122-e89b-12d3-a456-426614174000",
    "labels": ["User, Profile, Tree, Root, Leaf"],
    "classID": "2ff4d122-e89b-12d3-a456-426614174000",
    "fields": {
        "name": "Adam",
        "actions": ["c_Project", "r_Project", "u_Project", "d_Project"]
    },
    "edges": {
        "controls": {
            "ID": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Alpha Project",
            "projectNumber": "A1234"
        }
    }
}

GET /object/3ff4d122-e89b-12d3-a456-426614174000?includeClass=true&extended=false
response body:
{
    "ID": "3ff4d122-e89b-12d3-a456-426614174000",
    "labels": ["User, Profile, Tree, Root, Leaf"],
    "class": {
        "ID": "2ff4d122-e89b-12d3-a456-426614174000",
        "name": "User",
        "labels": ["User, Profile, Tree, Root, Leaf"],
        "fields": {
            ...
        },
        "edges": {
            ...
        }
    },
    "fields": {
        "name": "Adam",
        "actions": ["c_Project", "r_Project", "u_Project", "d_Project"]
    }
}