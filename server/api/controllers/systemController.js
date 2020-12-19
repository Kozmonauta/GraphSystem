'use strict';

var systemModel = require('../models/systemModel');
var classService = require('../services/classService');
var objectService = require('../services/objectService');

exports.create = function(req, res) {
    logger.log('systemController.create', {type: 'function'});
    
    var classes = {
        "Root": {
            "abstract": true,
            "label": "Root",
            "edges": {
                "children": {
                    "direction": "out",
                    "multiple": true
                }
            }
        },
        "Leaf": {
            "abstract": true,
            "label": "Leaf",
            "edges": {
                "parent": {
                    "direction": "in"
                }
            }
        },
        "Pipe": {
            "abstract": true,
            "label": "Pipe",
            "extends": "$Leaf",
            "edges": {
                "child": {
                    "direction": "out"
                }
            }
        },
        "Tree": {
            "abstract": true,
            "label": "Tree",
            "extends": ["$Root", "$Leaf"]
        },
        "Profile": {
            "label": "Profile",
            "extends": "$Tree",
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
            "label": "User",
            "extends": "$Profile",
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
        }
    };
        
    systemModel.create(classes, objects)
        .then(result => {
            // error
            if (result.records === undefined || result.records.length === 0) {
                res.status(400);
                res.json({
                    "errors": [
                        {
                            "message": texts.system.create.error
                        }
                    ]
                });
            } 
            // success
            else {
                const createdClasses = result.records[0];
                
                res.status(200);
                res.json({
                    "message": texts.system.create.success,
                    "records": classService.decodeClassList(createdClasses)
                });            
            } 
        }, result => {
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
