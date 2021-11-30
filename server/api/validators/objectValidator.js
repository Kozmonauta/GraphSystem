'use strict';

var generalValidator = require('../validators/generalValidator');
var objectModel = require('../models/objectModel');
var userModel = require('../models/userModel');
var errorHandler = require('../errorHandler');
var neo4jUtils = require('../neo4jUtils');

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
    
    if (typeof o.nodes !== 'object') {
        res.push({type: 'error', message: 'Nodes must be presented as an object'});
    }
    
    if (typeof o.edges !== 'object') {
        res.push({type: 'error', message: 'Edges must be presented as an object'});
    }
    
    return res;
};

exports.createObjectWithClassCheck = function(o, c) {
    let res = [];
    
    // Check if all class nodes, which has >=1 incoming H/C edges and has >=1 outgoing H/C edges then they must be connected with a one way route of the same edge types
    // This validator perhaps should be in classValidator
    
    // if (neo4jUtils.findPath(c, n1, n2) === undefined) {
        // res.push({type: 'error', message: 'No path found between incoming and outgoing edges'});
        // return res;
    // }
    
    // Check invalid node keys
    for (let nk in o.nodes) {
        if (c.nodes[nk] === undefined) {
            res.push({type: 'error', message: 'Invalid node key for class'});
            return res;
        }
    }
    
    // Check invalid node fields
    for (let nk in o.nodes) {
        if (Object.keys(o.nodes[nk]).length > 0) {
            if (c.nodes[nk].fields === undefined) {
                res.push({type: 'error', message: 'Node [' + nk + '] must not have any fields'});
                return res;
            }
            
            for (let fk in o.nodes[nk]) {
                if (c.nodes[nk].fields[fk] === undefined) {
                    res.push({type: 'error', message: 'Invalid field [' + fk + '] key for node [' + nk + ']'});
                    return res;
                }
            }
        }
    }
    
    // Check invalid edge keys
    for (let ek in o.edges) {
        if (c.edges[ek] === undefined) {
            res.push({type: 'error', message: 'Invalid edge key for class'});
            return res;
        }
    }
    
    // Check main node
    let mainNodeKey;
    
    for (let ek in c.edges) {
        let e = c.edges[ek];
        if (e.type === 'H' && e.source === undefined) {
            mainNodeKey = ek;
        }
    }
    
    if (o.edges[mainNodeKey] === undefined) {
        res.push({type: 'error', message: 'Main node must be set'});
    }

    // Check multiple edges
    for (let ek in o.edges) {
        if (c.edges[ek].multiple === true) {
            res.push({type: 'error', message: 'Multiple connections cannot be added in this request'});
        }
    }
    
    // TODO test this
    // Check if object wants to override a class defined edge's internal connection
    for (let ek in o.edges) {
        if ((c.edges[ek].source !== undefined && o.edges[ek].source !== undefined) || 
            (c.edges[ek].target !== undefined && o.edges[ek].target !== undefined)) {
            res.push({type: 'error', message: 'Cannot overwrite class internal edge definition'});
        }
    }
    
    return res;
};

exports.getRequestCheck = function(params, query) {
    var res = [];
    
    if (params === undefined || params.id === undefined) {
        res.push({type: 'error', message: 'Object id is required'});
    }
    
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

