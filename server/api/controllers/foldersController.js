'use strict';

var foldersModel = require('../models/foldersModel');

exports.add = function(req, res) {
    var c = foldersModel.add(req.body, 
        function(rRes) {
            res.status(200);
            res.json({'message':rRes});
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};

exports.update = function(req, res) {
    foldersModel.update(req.body,
        function(rRes) {
            res.status(200);
            res.json({'message':rRes});
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};

exports.find = function(req, res) {
    console.log('[foldersController.find]');
    console.log('req.query', req.query);
    foldersModel.findForUser({pid: req.query.pid},
        function(rRes) {
            var fRes = rRes[0];
            var folders = {
                id: fRes.id,
                items: []
            };
            var profileActions = fRes.profileActions;
            var items = fRes.items.length ? JSON.parse(fRes.items) : [];

            for (var i=0;i<items.length;i++) {
                if (items[i].data === undefined) {
                    folders.items.push(items[i]);
                } else 
                    
                if ((items[i].data.type === 'classList' || items[i].data.type === 'classForm') && profileActions.includes('r_Class')) {
                    folders.items.push(items[i]);
                } else
                    
                if (items[i].data.type === 'objectList' || items[i].data.type === 'objectForm') {
                    if (items[i].data === undefined || items[i].data.filter === undefined || items[i].data.filter.classId === undefined) continue;
                    
                    var itemClass = items[i].data.filter.classId;
                    if (profileActions.includes('r_' + itemClass)) {
                        folders.items.push(items[i]);
                    }
                }
            }
            // console.log('folders', folders);
            res.status(200);
            res.json([folders]);
            return;
        },
        function(rErr) {
            console.log('DB???', rErr);
            res.status(400);
            res.json({'error':'db error'});
            return;
        }
    );
};

exports.get = function(req, res) {
    console.log('[foldersController.get]');
    console.log('req.query', req.query);
    foldersModel.get({pid: req.query.pid}, 
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

exports.delete = function(req, res) {
    var id = req.params.id;
    foldersModel.delete(id,
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

