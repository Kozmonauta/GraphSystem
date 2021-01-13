'use strict';

var systemModel = require('../models/systemModel');
var objectModel = require('../models/objectModel');
var classService = require('../services/classService');
var objectService = require('../services/objectService');
var util = require('util');

// Creates the initial database
// - core
// - classes
// - objects
exports.create = function(req, res) {
    logger.log('systemController.create', {type: 'function'});
    
    var classes = {
        "Root": {
            "abstract": true,
            "labels": ["Root"],
            "name": "Root",
            "edges": {
                "children": {
                    "direction": "out",
                    "multiple": true
                }
            }
        },
        "Leaf": {
            "abstract": true,
            "labels": ["Leaf"],
            "name": "Leaf",
            "edges": {
                "parent": {
                    "direction": "in"
                }
            }
        },
        "Pipe": {
            "abstract": true,
            "labels": ["Pipe"],
            "extends": "$Leaf",
            "name": "Pipe",
            "edges": {
                "child": {
                    "direction": "out"
                }
            }
        },
        "Tree": {
            "abstract": true,
            "labels": ["Tree"],
            "name": "Tree",
            "extends": ["$Root", "$Leaf"]
        },
        "Profile": {
            "labels": ["Profile"],
            "extends": "$Tree",
            "name": "Profile",
            "fields": {
                "actions": {
                    "type": "array",
                    "items": {
                        "type": "string"                
                    }
                }
            },
            "edges": {
                "controls": {
                    "type": "C",
                    "direction": "out",
                    "required": true
                },
                "parent": {
                    "type": "H"
                },
                "children": {
                    "type": "H"
                }
            }
        },
        "User": {
            "labels": ["User"],
            "extends": "$Profile",
            "name": "User",
            "fields": {
                "name": {
                    "type": "string",
                    "required": true
                }
            },
            "edges": {
                "authenticator": {
                    "type": "A",
                    "direction": "in",
                    "multiple": true,
                    "required": true
                }
            }
        },
        "Account": {
            "labels": ["Account"],
            "name": "Account",
            "fields": {
                "email": {
                    "type": "string",
                    "required": true
                },
                "password": {
                    "type": "string",
                    "required": true
                }
            },
            "edges": {
                "authenticates": {
                    "type": "A",
                    "direction": "out",
                    "multiple": true
                }
            }
        },
        "Client": {
            "labels": ["Client"],
            "name": "Client",
            "fields": {
                "token": {
                    "type": "string"
                }
            },
            "edges": {
                "server": {
                    "type": "S",
                    "direction": "in",
                    "required": true
                }
            }
        }
    };

    // stringify JSON fields
    for (var ck in classes) {
        if (classes[ck].fields !== undefined) {
            classes[ck].fields = JSON.stringify(classes[ck].fields);
        }
        if (classes[ck].edges !== undefined) {
            classes[ck].edges = JSON.stringify(classes[ck].edges);
        }
    }
        
    systemModel.hasCore()
        .then(hasCoreResult => {
            if (hasCoreResult === true && false) {
                res.status(400);
                res.json({
                    "errors": [
                        {
                            "message": "Core already exists"
                        }
                    ]
                });
                
                return;                
            }
            
            systemModel.createCore()
                .then(createCoreResult => {
                    systemModel.createClasses(classes, createCoreResult)
                        .then(createClassesResult => {
                            for (var ck in classes) {
                                classes[ck].ID = createClassesResult[ck + 'ID'];
                            }

                            systemModel.getInheritClasses(createCoreResult)
                                .then(getClassesResult => {
                                    for (var i=0;i<getClassesResult.length;i++) {
                                        if (getClassesResult[i].ID === classes['User'].ID) {
                                            classes['User'] = getClassesResult[i];
                                        }
                                        if (getClassesResult[i].ID === classes['Account'].ID) {
                                            classes['Account'] = getClassesResult[i];
                                        }
                                    }
                                    
                                    var coreAdministrator = {
                                        "class": classes['User'],
                                        "fields": {
                                            "name": "Core Administrator",
                                            "actions": ["*"]
                                        },
                                        "edges": {
                                            "controls": {
                                                "ID": createCoreResult.ID
                                            },
                                            "authenticator": {
                                                "class": classes['Account'],
                                                "fields": {
                                                    "email": "admin@graphsystem.io",
                                                    "password": "********"
                                                },
                                                "edges": {
                                                    "authenticates": "$this.authenticator"
                                                }
                                            }
                                        }
                                    };
                                    console.log("coreAdministrator: ", util.inspect(coreAdministrator, {showHidden: false, depth: null}));
                                    
                                    objectModel.create(coreAdministrator)
                                        .then(createObjectsResult => {
                                            res.status(200);
                                            res.json({
                                                "message": texts.system.create.success
                                            });
                                        }, createObjectsResult => {
                                            res.status(400);
                                            res.json({
                                                "errors": [
                                                    {
                                                        "message": texts.system.create.error
                                                    }
                                                ]
                                            });
                                        })
                                    ;
                                }, getClassesResult => {
                                    res.status(400);
                                    res.json({
                                        "errors": [
                                            {
                                                "message": texts.system.create.error
                                            }
                                        ]
                                    });
                                })
                            ;
                        }, createClassesResult => {
                            res.status(400);
                            res.json({
                                "errors": [
                                    {
                                        "message": texts.system.create.error
                                    }
                                ]
                            });
                        })
                    ;
                }, createCoreResult => {
                    res.status(400);
                    res.json({
                        "errors": [
                            {
                                "message": texts.system.create.error
                            }
                        ]
                    });            
                })
            ;
        }, hasCoreResult => {
            res.status(400);
            res.json({
                "errors": [
                    {
                        "message": texts.system.create.error
                    }
                ]
            });            
        })
    ;
};
