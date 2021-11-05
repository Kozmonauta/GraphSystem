{
    "info": "Find objects filtered by class based conditions",
    "classId": 1,
    "sort": ["+$field.name"],
    "conditions": [
        { "le": ["$fields.time", "$now"] },
        { "e": ["$connections.reporter.$connections.role", "$roleId"] },
        { "le": ["$connections.reporter.createdOn", "$OneYearAgo"] }
    ]
}