POST /object

Examples
--------

{
    "class": "f3f851c3-14d6-4809-ae02-1becc011ff89",
    "$name": "user",
    "fields": {
        "name": "Adam",
        "actions": ["*"]
    },
    "edges": {
        "controls": {
            "endpoint": {
                "id": "f7862d75-23f1-49e5-807c-b445153ddf04"
            }
        }
    },
    "actions": {
        "create.success": {
            "account": {
                "action": "createObject",
                "parameters": {
                    "class": "09b220c2-3274-4f05-9884-1a105706891b",
                    "$name": "account",
                    "fields": {
                        "email": "adam@graphsystem.io",
                        "password": "asdf"
                    },
                    "edges": {
                        "authenticates": {
                            "endpoint": "$user"
                        }
                    },
                    "actions": {
                        "create.success": {
                            "account": {
                                "action": "createObject",
                                "parameters": {
                                    "class": "09b220c2-3274-4f05-9884-1a105706891b",
                                    "fields": {
                                        "email": "adam@graphsystem.io",
                                        "password": "asdf"
                                    },
                                    "edges": {
                                        "authenticates": {
                                            "endpoint": "$user"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

{
    "class": "f3f851c3-14d6-4809-ae02-1becc011ff89",
    "$name": "user",
    "fields": {
        "name": "Barney",
        "actions": ["c<C", "u<C"]
    },
    "edges": {
        "controls": {
            "endpoint": {
                "id": "f7862d75-23f1-49e5-807c-b445153ddf04"
            }
        }
    },
    "actions": {
        "create.success": {
            "account": {
                "action": "createObject",
                "parameters": {
                    "class": "09b220c2-3274-4f05-9884-1a105706891b",
                    "$name": "account",
                    "fields": {
                        "email": "adam@graphsystem.io",
                        "password": "asdf"
                    },
                    "edges": {
                        "authenticates": {
                            "endpoint": "$user"
                        }
                    },
                    "actions": {
                        "create.success": {
                            "account": {
                                "action": "createObject",
                                "parameters": {
                                    "class": "09b220c2-3274-4f05-9884-1a105706891b",
                                    "fields": {
                                        "email": "adam@graphsystem.io",
                                        "password": "asdf"
                                    },
                                    "edges": {
                                        "authenticates": {
                                            "endpoint": "$user"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

POST /object/{id}

request body:
{
    "id": "f7862d75-23f1-49e5-807c-b445153ddf04"
    "class": "f3f851c3-14d6-4809-ae02-1becc011ff89",
    "fields": {
        "name": "Adam",
        "actions": ["*"]
    },
    "edges": {
        "controls": {
            "id": "f7862d75-23f1-49e5-807c-b445153ddf04",
            "endpoint": {
                "id": "f7862d75-23f1-49e5-807c-b445153ddf04"
            }
        }
    },
    "actions": {
        "create.success": {
            "account": {
                "action": "createObject",
                "parameters": {
                    "id": "09b220c2-3274-4f05-9884-1a105706891b",
                    "class": "09b220c2-3274-4f05-9884-1a105706891b",
                    "fields": {
                        "email": "adam@graphsystem.io",
                        "password": "asdf"
                    },
                    "edges": {
                        "id": "09b220c2-3274-4f05-9884-1a105706891b",
                        "authenticates": {
                            "endpoint": "$parent"
                        }
                    }
                }
            }
        }
    }
}

--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

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

--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

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

--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==