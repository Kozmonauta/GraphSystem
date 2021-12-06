'use strict';

var generalValidator = require('../validators/generalValidator');

exports.createExtendedCheck = function(c) {
    logger.log('classValidator.createExtendedCheck', {type: 'function'});
// console.log('c', utils.showJSON(c));

    let errors = [];

    //
    // formal requirements
    
    // check invalid fields in class root object
    const validClassFieldKeys = ['id', 'name', 'nodes', 'edges', 'definer', 'extends'];
    let invalidClassFieldKeyFound = false;
    for (let fk in c) {
        if (!validClassFieldKeys.includes(fk)) {
            invalidClassFieldKeyFound = true;
            errors.push({
                message: 'Invalid field: ' + fk
            });
        }
    }

    if (invalidClassFieldKeyFound === true) {
        return errors;
    }
    
    // check if name valid
    if (c.name === undefined || typeof c.name !== 'string' || c.name.length === 0) {
        errors.push({
            message: 'Class must have a non empty name'
        });
        return errors;
    }
    
    // check if any node is defined
    if (c.nodes === undefined || typeof c.nodes !== 'object' || Object.keys(c.nodes).length === 0) {
        errors.push({
            message: 'Class must have >=1 nodes'
        });
        return errors;
    }
    
    // check if any edge is defined
    if (c.edges === undefined || typeof c.edges !== 'object' || Object.keys(c.edges).length === 0) {
        errors.push({
            message: 'Class must have >=1 edges'
        });
        return errors;
    }
    
    // check if node keys and node field keys are valid
    const validNodeFieldKeys = ['name', 'label', 'fields', 'optional'];
    let invalidNodeFound = false;
    for (let nk in c.nodes) {
        const n = c.nodes[nk];
        
        // invalid node key
        if (!nk.match("^[A-Za-z0-9_]+$") || nk.substring(0,1) === '_') {
            invalidNodeFound = true;
            errors.push({
                message: 'Node keys must contain only letters, numbers and underscores. The first letter must not be underscore. Check: ' + nk
            });
            break;
        }

        // bad node definition
        if (typeof n !== 'object') {
            invalidNodeFound = true;
            errors.push({
                message: 'Node must be an object: ' + nk
            });
            break;
        } 

        // invalid node field key
        for (let nfk in n) {
            if (!validNodeFieldKeys.includes(nfk)) {
                invalidNodeFound = true;
                errors.push({
                    message: 'Invalid node field key: ' + nk + '.' + nfk
                });
            }
        }
        
        // check node name
        if (n.name === undefined || typeof n.name !== 'string' || n.name.length === 0) {
            invalidNodeFound = true;
            errors.push({
                message: 'Invalid name in node:' + nk
            });
        }
        
        // check node label
        if (n.label === undefined || typeof n.label !== 'string' || n.label.length === 0 || !n.label.match("^[A-Za-z0-9_]+$") || n.label.substring(0,1) === '_') {
            invalidNodeFound = true;
            errors.push({
                message: 'Invalid label in node:' + nk
            });
        }
        
        // check node fields
        for (let nfk in n.fields) {
            // TODO
        }
    }

    // check if edge keys and edge field keys are valid
    const validEdgeFieldKeys = ['source', 'target', 'type', 'multiple', 'optional'];
    let invalidEdgeFound = false;
    for (let ek in c.edges) {
        const e = c.edges[ek];
        
        // invalid edge key
        if (!ek.match("^[A-Za-z0-9_]+$") || ek.substring(0,1) === '_') {
            invalidEdgeFound = true;
            errors.push({
                message: 'Edge keys must contain only letters, numbers and underscores. The first letter must not be underscore. Check: ' + ek
            });
        }
        
        // bad edge definition
        if (typeof e !== 'object') {
            invalidEdgeFound = true;
            errors.push({
                message: 'Edge must be an object: ' + ek
            });
            break;
        }

        // invalid edge field key
        for (let efk in e) {
            if (!validEdgeFieldKeys.includes(efk)) {
                invalidEdgeFound = true;
                errors.push({
                    message: 'Invalid edge field key: ' + ek + '.' + efk
                });
            }
        }

        // source or target must be an internal node
        if (e.source === undefined && e.target === undefined) {
            invalidEdgeFound = true;
            errors.push({
                message: 'Edge must have at least one internal node endpoint (source or target): ' + ek
            });
        }
        
        // check source
        if (e.source !== undefined) {
            if (typeof e.source !== 'string') {
                invalidEdgeFound = true;
                errors.push({
                    message: 'Invalid edge source definition: ' + ek
                });
            }
            if (c.nodes[e.source] === undefined) {
                invalidEdgeFound = true;
                errors.push({
                    message: 'Referenced node key does not exists: ' + e.source + ' in ' + ek
                });
            }
        }
        
        // check target
        if (e.target !== undefined) {
            if (typeof e.target !== 'string') {
                invalidEdgeFound = true;
                errors.push({
                    message: 'Invalid edge target definition: ' + ek
                });
            }
            if (c.nodes[e.target] === undefined) {
                invalidEdgeFound = true;
                errors.push({
                    message: 'Referenced node key does not exists: ' + e.target + ' in ' + ek
                });
            }
        }
        
        // check type
        if (e.type === undefined || typeof e.type !== 'string' || e.type.length === 0 || !ek.match("^[A-Za-z0-9_]+$") || ek.substring(0,1) === '_') {
            invalidEdgeFound = true;
            errors.push({
                message: 'Invalid type definition in edge: ' + ek
            });
        }
        
        // check multiple
        if (e.multiple !== undefined && typeof e.multiple !== 'boolean') {
            invalidEdgeFound = true;
            errors.push({
                message: 'Multiple edge must be defined as true/false'
            });
        }
    }
    
    if (invalidNodeFound || invalidEdgeFound) {
        return errors;
    }
    
    //
    // informal requirements
    
    // check if exactly 1 main node is present
    let mainNodeCount = 0;
    for (let ek in c.edges) {
        const e = c.edges[ek];
        if (e.type === 'H' && e.source === undefined) {
            mainNodeCount++;
        }
    }
    
    if (mainNodeCount !== 1) {
        errors.push({
            message: 'Class must have 1 main node (node with H type incoming edge)'
        });
    }
    
    return errors;
};

exports.createResultCheck = function(cr) {
    let errors = [];
    
    if (cr.records === undefined || cr.records.length === 0) {
        errors.push({
            message: 'Class could not be created'
        });
    } 
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

