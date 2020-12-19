'use strict';

var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');

exports.perform = function(req, res) {
    var data = req.body;
    data = {
        objectId: 1,
        type: 'email',
        parameters: {
            
        }
    };
    
    if (data.type === 'email') {
        //emailService.send(parameters);
    }
    console.log('data arrived', data);
    var classId = data.classId;
    classModel.get(classId, {}, 
        function(rRes) {
            var c = objectModel.add(data, 
                function(rRes) {
                    res.status(200);
                    res.json({'message':rRes});
                },
                function(rErr) {
                    res.status(400);
                    res.json({'error':'db error'});        
                }
            );
        },
        function(rErr) {
            res.status(400);
            res.json({'error':'db error'});        
        }
    );
};
