'use strict';

var systemModel = require('../models/systemModel');
var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');
var classService = require('../services/classService');
var objectService = require('../services/objectService');
var systemConfig = require("../../config/system_init.json");

// Creates the initial database: core node, default classes, default objects
exports.create = function(req, res) {
    logger.log('systemController.create', {type: 'function'});
    
    // Is system already initialized?
    systemModel.hasCore()
    .then(hasCoreResult => {
        if (hasCoreResult === true) {
            throw new Error("System is already initialized");
        }
        
        // Create core
        systemModel.createCore()
        .then(createCoreResult => {
            var defaultClasses = systemConfig.classes;
            var profileClass = defaultClasses['Profile'];
            
            profileClass.definer = createCoreResult.id;
            
            classModel.create(profileClass)
            .then(createProfileClassResult => {
                var userClass = defaultClasses['User'];
                userClass.definer = createCoreResult.id;
                userClass['extends'] = createProfileClassResult.id;

                classModel.create(userClass)
                .then(createUserClassResult => {
                    res.status(200);
                    res.json({"message": "Created"});
                })
                .catch(e => {
                    console.log('createUserClassError');
                    throw new Error(e);
                });
            })
            .catch(e => {
                console.log('createProfileClassError');
                throw new Error(e);
            });
        })
        .catch(e => {
            console.log('createCoreError');
            throw new Error(e);
        });
    })
    .catch(e => {
        console.log(e);
        res.status(400);
        res.json({"errors": [{"message": "Error"}]});
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
