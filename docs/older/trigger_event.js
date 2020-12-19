{
    "object":{
        "id":1
    },
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
