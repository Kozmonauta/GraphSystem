'use strict';

var generalValidator = require('../validators/generalValidator');
var objectModel = require('../models/objectModel');
var userModel = require('../models/userModel');
var errorHandler = require('../errorHandler');

exports.createRequestCheck = function(o) {
    var res = [];
    
    if (o['class'] === undefined) {
        res.push({type: 'error', message: 'Class is required'});
    }
    
    if (o.nodes === undefined) {
        res.push({type: 'error', message: 'Nodes is required'});
    }
    
    if (o.edges === undefined) {
        res.push({type: 'error', message: 'Edges is required'});
    }
    
    return res;
};

exports.createObjectWithClassCheck = function(o, c) {
    var res = [];
    
    // console.log('c', utils.showJSON(c));
    // console.log('o', utils.showJSON(o));
    // res.push({type: 'error', message: 'COWCC error'});

    return res;
};

exports.create = function(o, c, res, options) {
    
    
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

