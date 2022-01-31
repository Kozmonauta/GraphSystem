'use strict';

var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');
var userModel = require('../models/userModel');
var classService = require('../services/classService');
var classValidator = require('../validators/classValidator');
var errorHandler = require('../errorHandler');

exports.create = async function(req, res) {
    logger.log('classController.create', {type: 'controllerFunction'});
    
    var c = req.body;
    console.log('Class name: ', c.name);
    if (c['extends'] !== undefined) {
        try {
            const superClasses = await classModel.get(c['extends']);
            
            // In case of extending multiple classes
            if (Array.isArray(c['extends'])) {
                for (let sck in superClasses) {
                    utils.mergeObjects(c, superClasses[sck]);
                }
            } else 
            // Extending 1 class
            {
                utils.mergeObjects(c, superClasses);
            }
        } catch (e) {
            throw e;
        } finally {
            delete c['extends'];
        }
    }
    
    const validationErrors = classValidator.createExtendedCheck(c);
    console.log('validationErrors', validationErrors);

    if (validationErrors.length > 0) {
        res.status(400);
        res.json(validationErrors);
        return;
    }
    
    try {
        const createClassResult = await classModel.create(c);
        // const ccResult = classValidator.createResultCheck(createClassResult);
        
        // if (ccResult.errors.length > 0) {
            // throw ccResult;
        // }

        res.status(200);
        res.json(createClassResult);
    } catch(e) {
        res.status(400);
        res.json(e);
        // return;
    }
    
    // classModel.create(c)
    // .then(createClassResult => {
        // var ccResult = classValidator.createResultCheck(createClassResult);
        
        // if (ccResult.errors.length > 0) {
            // res.status(400);
            // res.json(ccResult);
            // return;
        // }

        // res.status(200);
        // res.json(createClassResult);
    // })
    // .catch(e => {
        // res.status(400);
        // res.json(e);
    // });
};

exports.createSimple = function(req, res) {
};

exports.update = function(req, res) {
    var classData = req.body;
    
    userModel.getById({id: pid},
        function(userRes) {
            if (userRes.actions.includes('u_Class')) {
                classModel.update(classData, 
                    function(classRes) {
                        if (!returned) {
                            res.status(200);
                            res.json({'message':rRes});
                            returned = true;
                        }
                    },
                    function(rErr) {
                        if (!returned) {
                            res.status(400);
                            res.json({'error': 'db error1'});
                            returned = true;
                        }
                    }
                );
            } else {
                if (!returned) {
                    res.status(403);
                    res.json({'message': 'Not allowed'});
                    returned = true;
                }
            }
        },
        function(rErr) {
            if (!returned) {
                res.status(400);
                res.json({'error':'db error2'});
                returned = true;
            }
        },
        function(rErr) {
            if (!returned) {
                res.status(400);
                res.json({'error':'user not found'});
                returned = true;
            }
        }
    );
};

exports.find = function(req, res) {
    console.log('------------------------------------------------');
    console.log('[classController.find]');
    console.log('req.query', req.query);
    
    if (req.query.ids === undefined) {
        classModel.find(req.query,
            function(rRes) {
                res.status(200);
                res.json(rRes);
                return;
            },
            function(rErr) {
                res.status(400);
                res.json({'error':'db error'});
                return;
            }
        );
    } else {
        var ids = [];
        if (req.query.ids !== undefined) {
            for (var ik in req.query.ids) {
                ids.push(req.query.ids[ik]);
            }
        }
        
        classModel.findByIds(ids,
            function(rRes) {
                res.status(200);
                res.json(rRes);
                return;
            },
            function(rErr) {
                res.status(400);
                res.json({'error':'db error'});        
                return;
            }
        );
    }
};

exports.get = function(req, res) {
    var id = req.params.id;
    var options = {
        mode: req.query.mode === undefined ? 'simple' : req.query.mode
    };
    classModel.get({id:id}, options, 
        function(rRes) {
            var classData = rRes;
            // var classData = classService.parseJSONs(rRes);
            res.status(200);
            res.json(classData);
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};

exports.delete = function(req, res) {
    var id = req.params.id;
    classModel.delete({id:id},
        function(rRes) {
            res.status(200);
            res.json(rRes);
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};

exports.deleteMass = function(req, res) {
    var ids = req.body.classes;
    classModel.deleteMass(ids,
        function(rRes) {
            res.status(200);
            res.json(rRes);
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};

