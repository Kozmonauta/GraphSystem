'use strict';

var systemModel = require('../models/systemModel');
var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');
var classService = require('../services/classService');
var objectService = require('../services/objectService');
var systemConfig = require("../../config/system_init.json");
var systemValidator = require('../validators/systemValidator');
var errorHandler = require('../errorHandler');

// Creates the initial database: core node, default classes, default objects
exports.create = function(req, res) {
    logger.log('systemController.create', {type: 'controllerFunction'});
    
    const sccResult = systemValidator.systemConfigCheck(systemConfig);
    if (!errorHandler.isValid(sccResult)) {
        res.status(400);
        res.json(sccResult);
        return;
    }
        
    // Is system already initialized?
    systemModel.hasCore()
    .then(hasCoreResult => {
        if (hasCoreResult === true) {
            throw new Error("System is already initialized");
        }
        
        // Create core
        systemModel.createCore()
        .then(createCoreResult => {
            res.status(200);
            res.json(createCoreResult);
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
