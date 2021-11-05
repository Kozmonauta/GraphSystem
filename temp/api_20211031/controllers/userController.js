'use strict';

var userModel = require('../models/userModel');

exports.getUserInfo = function(req, res) {
    var data = {
        id: req.query.uid
    };
    var returned = false;
    
    userModel.getById(data,
        function(rRes) {
            rRes.userLetter = rRes.name[0];
            rRes.userName = rRes.name;
            // TODO read from Profile
            rRes.dateFormat = 'Y.m.d';
            rRes.timeFormat = 'H:i';
            
            res.status(200);
            res.json(rRes);
            returned = true;
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});
        },
        function(rErr) {
            if (!returned) {
                res.status(400);
                res.json({'error':'user not found'});
            }
        }
    );
};

exports.login = function(req, res) {
    var data = req.body;
    var done = false;
    
    userModel.getByEmail(data,
        function(rRes) {
            console.log('R0');
            console.log('LOGIN', rRes);
            if (data.password !== rRes.password) {
                delete rRes.password;
                res.status(401);
                done = true;
                res.json({'error':'auth error'});
            } else {
            console.log('success');
                delete rRes.password;
                res.status(200);
                done = true;
                res.json(rRes);
            }
        },
        function(rErr) {
            console.log('R1');
            res.status(400);
            done = true;
            res.json({'error':'db error'});
        },
        function() {
            console.log('R2');
            if (!done) {
                res.status(401);
                res.json({'error':'other login error'});
            }
        }
    );
};

exports.activateAccount = function(req, res) {
    console.log('... activateAccount ...');
    var done = false;
    var data = req.body;
    data.token = req.params.token;
    
    userModel.activateAccount(data,
        function(rRes) {
            res.status(200);
            done = true;
            res.json(rRes);
        },
        function(rErr) {
            res.status(400);
            done = true;
            res.json({'error':'db error'});
        },
        function() {
            if (!done) {
                res.status(401);
                res.json({'error':'other login error'});
            }
        }
    );
};

exports.saveFolders = function(req, res) {
    console.log('saveFolders');
    var data = req.body;
    console.log('data', data);
    
    userModel.saveFolders(data,
        function(rRes) {
    console.log('1', rRes);
            res.status(200);
            done = true;
            res.json(rRes);
        },
        function(rErr) {
    console.log('2', rErr);
            res.status(400);
            done = true;
            res.json({'error':'db error'});
        },
        function() {
    console.log('3');
            if (!done) {
                res.status(401);
                res.json({'error':'other login error'});
            }
        }
    );
};

