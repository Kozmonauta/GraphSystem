'use strict';

var generalValidator = require('../validators/generalValidator');
var objectModel = require('../models/objectModel');
var userModel = require('../models/userModel');

exports.hasClass = function(res, o) {
    if (utils.isEmpty(o.classId)) {
        res = utils.addError({code: 'class_id_required', message: 'Class id required'}, res);
    }
    
    if (res === undefined) res = { valid: true, items: [] };
    
    return res;
};

exports.checkRequired = function(res, o, c, options) {
    if (options === undefined) options = {};
    
    for (var fk in c.fields) {
        if (utils.isTrue(c.fields[fk].required) && utils.isEmpty(o.fields[fk]) && c.fields[fk].textType !== 'password') {
            utils.addError({
                code: 'object_field_required',
                fieldKey: fk,
                fieldName: c.fields[fk].name
            }, res);
        }
    }
    
    for (var ck in c.connections) {
        if (utils.isTrue(c.connections[ck].required) && utils.isEmpty(o.connections[ck])) {
            utils.addError({
                code: 'object_connection_required',
                fieldKey: ck,
                fieldName: c.connections[ck].name
            }, res);
        }
    }
};

exports.checkFormat = function(res, o, c, options) {
    if (options === undefined) options = {};
    
    // if (propertyClass.type === 'text' && propertyClass.textType === 'email') {
        // res = generalValidator.email(property, res);
    // }
    for (var fk in c.fields) {
        if (utils.isTrue(c.fields[fk].required) && utils.isEmpty(o.fields[fk]) && c.fields[fk].textType !== 'password') {
            utils.addError({
                code: 'object_field_required',
                fieldKey: fk,
                fieldName: c.fields[fk].name
            }, res);
        }
    }
};

exports.add = function(o, c, res, options) {
    if (options === undefined) options = {};
    
    var coreId;
    for (var nk in c.nodes) {
        var nodeClass = c.nodes[nk];
        if (nodeClass.type === 'core') {
            coreId = o.nodes[nk].id;
        }
    }
    
    for (var nk in c.nodes) {
        var nodeClass = c.nodes[nk];
        
        for (var pk in nodeClass.properties) {
            var propertyClass = nodeClass.properties[pk];
            
            if (o.nodes[nk] === undefined) {
                res = utils.addError({
                    code: 'object_node_required',
                    nodeKey: nk
                }, res);
            }
            
            var property = o.nodes[nk][pk];
            if (propertyClass.required === true) {
                if (propertyClass.textType !== 'password' || o.nodes[nk].id === options.pid) {
                    if (utils.isEmpty(property)) {
                        res = utils.addError({
                            code: 'node_property_required',
                            propertyKey: nk + '.' + pk
                        }, res);
                    }
                }
            }
            
            if (propertyClass.type === 'text' && propertyClass.textType === 'email') {
                res = generalValidator.email(property, res);
            }
            
            // @TODO handle property.rules
        }
    }
    
    if (res === undefined) res = { valid: true, items: [] };
    
    return res;
};

exports.account = function(o, c, res, options) {
    if (res === undefined) res = { valid: true, items: [] };
    
    var email = o.nodes['Account'].email;
            console.log('account vali', email);
    var done = false;

    userModel.getByEmail({email: email},
        function(rRes) {
            console.log('getByEmail', rRes);
            done = true;
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
    var sameEmails = objectModel.find();
    
    
    return res;
};

exports.update = function(o, c, res) {
    console.log('ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo UPDATE');
    console.log('o', o);
    // console.log('c', c);
    
    for (var nk in o.nodes) {
        var node = o.nodes[nk];
        var nodeClass = c.nodes[nk];
        
        for (var pk in node) {
            var propertyValue = node[pk];
            if (pk === 'id') {
                if (utils.isEmpty(propertyValue)) {
                    res = utils.addError({code: 'object_id_required', message: 'Object id required'}, res);
                }
                continue;
            }
            
            var propertyClass = nodeClass.properties[pk];
            
            if (propertyClass.type === 'text' && propertyClass.textType === 'email') {
    console.log('EMAIL', propertyValue);
                res = generalValidator.email(propertyValue, res);
            }
            
            // console.log('propertyClass', propertyClass);
        }
    }
    console.log('valid result', res);
    return res;
};

exports.delete = function(object) {
};

