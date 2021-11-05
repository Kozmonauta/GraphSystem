'use strict';

var systemModel = require('../models/systemModel');
var objectModel = require('../models/objectModel');
var classService = require('../services/classService');
var objectService = require('../services/objectService');
var systemInit = require("../../config/system_init.json");

// Creates the initial database
// - core
// - classes
// - objects
exports.create = function(req, res) {
    logger.log('systemController.create', {type: 'function'});
    
    var classes = systemInit.classes;
    
    // stringify JSON fields
    for (var ck in classes) {
        // if (classes[ck].nodes !== undefined) {
            // classes[ck].nodes = JSON.stringify(classes[ck].nodes);
        // }
        if (classes[ck].fields !== undefined) {
            classes[ck].fields = JSON.stringify(classes[ck].fields);
        }
        if (classes[ck].edges !== undefined) {
            classes[ck].edges = JSON.stringify(classes[ck].edges);
        }
        if (classes[ck].actions !== undefined) {
            classes[ck].actions = JSON.stringify(classes[ck].actions);
        }
    }

    // Is system initialized?
    systemModel.hasCore()
        .then(hasCoreResult => {
            if (hasCoreResult === true) {
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
            
            var ret;
            
            // Create core
            systemModel.createCore()
                .then(createCoreResult => {
                    // Create basic classes
                    systemModel.createClasses(classes, createCoreResult)
                        .then(createClassesResult => {
                            
                            for (var ck in classes) {
                                classes[ck].id = createClassesResult[ck + 'Id'];
                            }
                            
                            // Inherited class data is needed
                            systemModel.getInheritClasses(createCoreResult)
                                .then(getClassesResult => {
                                    var inheritedClasses = {};
                                    
                                    for (var i=0;i<getClassesResult.length;i++) {
                                        if (getClassesResult[i].id === String(classes['User'].id)) {
                                            inheritedClasses['User'] = getClassesResult[i];
                                        }
                                        if (getClassesResult[i].id === String(classes['Account'].id)) {
                                            inheritedClasses['Account'] = getClassesResult[i];
                                        }
                                    }
                                    
                                    var coreAdministrator = {
                                        // "class": inheritedClasses['User'],
                                        "class": classes['User'].id,
                                        "fields": {
                                            "name": "Core Administrator",
                                            "actions": ["*"]
                                        },
                                        "edges": {
                                            "controls": {
                                                "endpoint": {
                                                    "id": createCoreResult.id
                                                }
                                            }
                                        },
                                        "actions": {
                                            "create.success": {
                                                "account": {
                                                    "action": "createObject",
                                                    "parameters": {
                                                        // "class": inheritedClasses['Account'],
                                                        "class": classes['Account'].id,
                                                        "fields": {
                                                            "email": "admin@graphsystem.io",
                                                            "password": "asdf"
                                                        },
                                                        "edges": {
                                                            "authenticates": {
                                                                "endpoint": "$parent"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };

                                    console.log("coreAdministrator: ", utils.showJSON(coreAdministrator));
                                    
                                    var msg = {
                                        'action': 'createObject',
                                        'parameters': coreAdministrator
                                    };
                                    var msgString = JSON.stringify(msg);
                                    MQService.send('actions', msgString);

                                    res.status(200);
                                    res.json({
                                        "message": "Created"
                                    });
                                }, getClassesResult => {
                                    console.log('e1');
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
                                    console.log('e2');
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
                                    console.log('e3');
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
                                    console.log('e4');
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

exports.clear = function(req, res) {
    systemModel.clear()
        .then(r => {
            res.status(200);
            res.json({
                "message": "Database erased"
            });
        }, res => {
            res.status(400);
            res.json({
                "message": "Error: Database couldn't be erased"
            });
        })
    ;
};
