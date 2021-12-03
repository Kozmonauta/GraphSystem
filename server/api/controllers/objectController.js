'use strict';

var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');
var objectValidator = require('../validators/objectValidator');
var classValidator = require('../validators/classValidator');
var eventService = require('../services/eventService');
var objectService = require('../services/objectService');
var classService = require('../services/classService');
var emailService = require('../services/emailService');
var errorHandler = require('../errorHandler');
var fs = require('fs');
const uuidv1 = require('uuid/v1');

exports.create = function(req, res) {
    logger.log('objectController.create', {type: 'function'});

    const pid = req.headers.pid;
    const o = req.body;
    const crcResult = objectValidator.createRequestCheck(o);
    
    if (!errorHandler.isValid(crcResult)) {
        res.status(400);
        res.json(crcResult);
        return;
    }
    
    classModel.get(o['class'])
    .then(getClassResult => {
        const extendedClassCheckResult = classValidator.createExtendedCheck(getClassResult);

        if (!errorHandler.isValid(extendedClassCheckResult)) {
            res.status(400);
            res.json(extendedClassCheckResult);
            return;
        }

        const objectWithClassResult = objectValidator.createObjectWithClassCheck(o, getClassResult);
        
        if (!errorHandler.isValid(objectWithClassResult)) {
            res.status(400);
            res.json(objectWithClassResult);
            return;
        }

        objectModel.create(o, getClassResult)
        .then(createObjectResult => {
            res.status(200);
            res.json(createObjectResult);
        })
        .catch(e => {
            res.status(400);
            res.json(errorHandler.createErrorResponse(e.message));
            return;
        });
    })
    .catch(e => {
        res.status(400);
        res.json(errorHandler.createErrorResponse(e.message));
        return;
    });
};

exports.get = function(req, res) {
    logger.log('objectController.get', {type: 'function'});
    console.log('req.params', req.params);
    console.log('req.query', req.query);
    
    const pid = req.headers.pid;
    const grcResult = objectValidator.getRequestCheck(req.params, req.query);
    
    if (!errorHandler.isValid(grcResult)) {
        res.status(400);
        res.json(grcResult);
        return;
    }
    
    let params = { objectID: req.params.id };
    
    if (req.query.label !== undefined) {
        params.objectLabel = req.query.label;
    }
    
    classModel.getForObject(params)
    .then(getClassResult => {
        objectModel.get(params, getClassResult.c)
        .then(getObjectResult => {
            // getObjectResult['class'] = getClassResult.id;
            res.status(200);
            res.json(getObjectResult);
        })
        .catch(e => {
            res.status(400);
            res.json(errorHandler.createErrorResponse(e.message));
            return;
        });
    })
    .catch(e => {
        res.status(400);
        res.json(errorHandler.createErrorResponse(e.message));
        return;
    });
};

exports.patch = function(req, res) {
    logger.log('objectController.patch', {type: 'function'});

    const pid = req.headers.pid;
    const o = req.body;
    const prcResult = objectValidator.patchRequestCheck(o);
    
    if (!errorHandler.isValid(prcResult)) {
        res.status(400);
        res.json(prcResult);
        return;
    }
    
    let params = { objectID: req.params.id };
    
    if (req.query.label !== undefined) {
        params.objectLabel = req.query.label;
    }
    
    classModel.getForObject(params)
    .then(getClassResult => {
        const extendedClassCheckResult = classValidator.createExtendedCheck(getClassResult.c);

        if (!errorHandler.isValid(extendedClassCheckResult)) {
            res.status(400);
            res.json(extendedClassCheckResult);
            return;
        }

        const objectWithClassResult = objectValidator.createObjectWithClassCheck(o, getClassResult);
        
        if (!errorHandler.isValid(objectWithClassResult)) {
            res.status(400);
            res.json(objectWithClassResult);
            return;
        }

        objectModel.create(o, getClassResult)
        .then(createObjectResult => {
            res.status(200);
            res.json(createObjectResult);
        })
        .catch(e => {
            res.status(400);
            res.json(errorHandler.createErrorResponse(e.message));
            return;
        });
    })
    .catch(e => {
        res.status(400);
        res.json(errorHandler.createErrorResponse(e.message));
        return;
    });
};

exports.findByEdge = function(req, res) {
    logger.log('objectController.findByEdge', {type: 'function'});
    
    console.log('request:', req.query);
    // TODO request validation
    
    const destinationEdge = {
        type: req.query.t,
        direction: req.query.d
    };
    
    objectModel.findByEdge(destinationEdge)
    .then(findByEdgeResult => {
        res.status(200);
        res.json(findByEdgeResult);
        return;
    })
    .catch(e => {
        res.status(400);
        res.json(errorHandler.createErrorResponse(e.message));
        return;
    });
};

// ==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--
// ==-- OLD PART --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--
// ==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--

exports.updateFields = function(req, res) {
    logger.log('objectController.updateFields', {type: 'function'});
    
    var params = req.body;
    var pid = req.headers.pid;
    var returned = false;
    
    objectModel.updateFields(params, function(oRes) {
        if (!returned) {
            res.status(200);
            res.json({'message': oRes});
            returned = true;
        }
    }, function(oErr) {
        if (!returned) {
            res.status(400);
            res.json({'error': 'db error'});
            returned = true;
        }
    });
};

exports.delete = function(req, res) {
    logger.log('objectController.delete', {type: 'function'});
    console.log('req.params', req.params);
    console.log('req.query', req.query);

    var objectId = req.params.id;
    var classId = req.query.ci;
    var classGetOptions = {
        mode: req.query.mode === undefined ? 'simple' : req.query.mode
    };
    
    classModel.get({id: classId}, classGetOptions, 
        function(classData) {
            var objectParams = {
                id: objectId,
                classData: classData
            };
            
            objectModel.getExistingConnections(objectParams, 
                function(existingConnections) {
                    var multipleFound = false;
                    for (var fk in existingConnections) {
                        console.log('existingConnections[fk]', existingConnections[fk]);
                        if (existingConnections[fk] === true) multipleFound = true;
                    }
                    
                        console.log('multipleFound', multipleFound);
                    if (multipleFound === true) {
            console.log('400 0????????');
                        res.status(400);
                        res.json({'error':'Still have connections'});
                        return;
                    }
                    
                    objectModel.delete(objectParams, 
                        function(rRes) {
            console.log('200 1????????');
                            res.status(200);
                            res.json(rRes);
                            return;
                        },
                        function(rErr) {
            console.log('400 1????????');
                            res.status(400);
                            res.json({'error':'db error'});        
                            return;
                        }
                    );
                },
                function(rErr) {
            console.log('400 2????????');
                    res.status(400);
                    res.json({'error':'db error'});        
                }
            );
        },
        function(rErr) {
            console.log('400 3????????');
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};

exports['import'] = function(req, res) {
    // console.log('================================');
    // console.log('================================');
    // console.log('objects import', req.body);

    var parentId = req.body.parentId;
    var classId = req.body.classId;
    var params = { 
        classId: classId,
        parentId: parentId 
    };
    // Load client secrets from a local file.
    fs.readFile('config/google/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        objectService.authorize(JSON.parse(content), objectService.addObjects, params);
    });
};

// Available parameters:
// ed: edgeDirection *
// el: edgeLabel *
// nci: nodeClassId
// ncl: nodeClassLabel
// cci: connectedNodeClassId
// rec: attach classData to response
exports.findByQuery = function(req, res) {
    logger.log('objectController.findByQuery', {type: 'function'});
    
    var pid = req.headers.pid;
    var filter = req.query;
    
    logger.log(filter, {name: 'filter'});

    if (filter.ed !== undefined && filter.el !== undefined) {
        if (filter.nci !== undefined) {
            classModel.get({id: filter.nci}, {mode: 'simple'}, 
                function(cRes) {
                    filter.classData = cRes;
                    
                    objectModel.findForEdge(filter, 
                        function(oRes) {
                            var r = {list: oRes}
                            if (filter.rec !== undefined) {
                                r.classData = cRes;
                            }
                            res.status(200);
                            res.json(r);
                            return;
                        },
                        function(oErr) {
                            res.status(400);
                            res.json({'error':'db error'});        
                            return;
                        }
                    );
                },
                function(cErr) {
                    res.status(400);
                    res.json({'error':'db error'});        
                }
            );
        } else {
            objectModel.findForEdge(filter,
                function(oRes) {
                    res.status(200);
                    res.json({list: oRes});
                    return;
                },
                function(oErr) {
                    res.status(400);
                    res.json({'error':'db error'});        
                    return;
                }
            );
        }
    } else 
    
    if (filter.classes !== undefined && filter.classes !== '') {
        objectModel.findByClasses(filter,
            function(oRes) {
                res.status(200);
                res.json({list:oRes});
                return;
            },
            function(oErr) {
                res.status(400);
                res.json({'error':'db error'});        
                return;
            }
        );
    }
};

exports.find = function(req, res) {
    logger.log('objectController.find', {type: 'function'});
    
    var pid = req.headers.pid;
    var params = req.body;
    var filter = params.filter;
    
    logger.log(params, {name: 'params'});
    
    if (filter.classId === undefined) {
        res.status(400);
        res.json({'error':'Filter validation error'});
        return;
    }
    
    if (utils.isEmpty(filter.conditions)) {
        delete filter.conditions;
    }
    
    classModel.get({id: filter.classId}, {mode:'simple'}, 
        function(cRes) {
            var classData = cRes;
            // console.log('classData.connections', classData.connections);
            
            objectModel.find(classData, params,
                function(oRes) {
                    // console.log('oRes', oRes);
                    
                    res.status(200);
                    if (params.classNeeded) {
                        res.json({'class': classData, list: oRes});
                    } else {
                        res.json({list: oRes});
                    }
                    return;
                },
                function(oErr) {
                    res.status(400);
                    res.json({'error':'db error'});
                    return;
                }
            );
        },
        function(cErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
    
};

exports.find2 = function(req, res) {
    logger.log('objectController.find2', {type: 'function'});
    
    var pid = req.headers.pid;
    var params = req.body;
    
    logger.log(params, {name: 'params'});
    
    if (utils.isEmpty(params.filter) || params.filter.classId === undefined) {
        res.status(400);
        res.json({'error':'Filter validation error'});
        return;
    }
    
    if (utils.isEmpty(params.filter.conditions)) {
        delete params.filter.conditions;
    }
    
    objectModel.find2({filter: params.filter, sort: params.sort},
        function(oRes) {
            res.status(200);
            if (params.classNeeded) {
                res.json({'class': classData, list: oRes});
            } else {
                res.json({list: oRes});
            }
            return;
        },
        function(oErr) {
            res.status(400);
            res.json({'error':'db error'});      
            return;
        }
    );
    
};

