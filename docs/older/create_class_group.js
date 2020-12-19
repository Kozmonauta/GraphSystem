{
    "label":"Group",
    "extends":{
        "id":222, // Core.Object
    },
    "container":{
        "id":111
    },
    "nodes":{
        "core":{
            "label":"Group"
        },
        "address":{
            "label":"Address",
            "properties":{
                "country":{
                    "type":"string"
                },
                "city":{
                    "type":"string"
                },
                "street":{
                    "type":"string"
                }
            }
        },
        "settings":{
            "label":"Settings",
            "properties":{
                "timeZone":{
                    "type":"string"
                },
                "currency":{
                    "type":"string"
                }
            }
        }
    },
    "edges":{
        "address":{
            "label":"LOCATED",
            "source":"core",
            "target":"address"
        },
        "settings":{
            "label":"USES",
            "source":"core",
            "target":"settings"
        }
    },
    "events":[
        {
            "object":"$this",
            "trigger":"create object",
            "condition":{
                "==":["$nodes.core.eventType","alert"]

                // "and":[
                    // {
                        // "==":["core.eventType","alert"]
                    // },
                    // {
                        // "==":["core.status","active"]
                    // }
                // ] 
            },
            "action":{
                "type":"email",
                "parameters":{
                    "to":"$profile{actions:[update]}",
                    "title":"Vis major!",
                    "content":"Jani véletlenül felgyújtotta a raktárat"
                }
            }
        }
    ]
}


GET http://graphsystem.io/alpha-company/project-1/reports
list reports with filter: MATCH (alpha-company)-[HAS]->(project-1)-[HAS]->(r:report) RETURN r

GET http://graphsystem.io/alpha-company/project-1/profiles