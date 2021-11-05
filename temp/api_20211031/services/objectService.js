var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');
var util = require('util');

var objectService = {
    
    create: async function(o, parameters) {
        logger.log('objectService.create', {type: 'function'});
        // console.log('object', utils.showJSON(o));
        
        if (parameters === undefined) {
            parameters = {};
        }
        
        if (typeof o['class'] === 'string') {
            o['class'] = await classModel.get(o['class']);
        }
        // console.log('object', utils.showJSON(o));
        
        var now = new Date().getTime();
        o.fields._classId = o['class'].id;
        o.fields._createdOn = new Date().getTime();
        o.fields._creator = ".";
        
        // Collect available incoming and outgoing edge types
        var ies = [];
        var oes = [];
        
        // o.fields._ies = ies;
        // o.fields._oes = oes;
        
        var oRes = await objectModel.create(o);
        
        // TODO check for error
        if (oRes !== false) {
            // console.log('pr.oRes', oRes);
            var events = o.events;
            var references = o.references === undefined ? {} : o.references;
            
            // unique name, used as reference
            if (o.name !== undefined) {
                references[o.name] = oRes.id;
            }

            if (events !== undefined) {
                if (events['create.success'] !== undefined) {
                    for (var k in events['create.success']) {
                        var action = events['create.success'][k];
                        // console.log('triggered action:', action);
                        if (action.action === 'createObject') {
                            var actionParameters = action.parameters;
                            if (actionParameters.edges !== undefined) {
                                for (ek in actionParameters.edges) {
                                    var e = actionParameters.edges[ek];
                                    // if it is a reference
                                    if (typeof e.endpoint === 'string' && e.endpoint.charAt(0) === '$') {
                                        var refName = e.endpoint.substring(1);
                                        
                                        if (references[refName] !== undefined) {
                                            e.endpoint = {
                                                "id": references[refName]
                                            }
                                        } else {
                                            console.log('No node reference found. Remove edge!');
                                        }
                                    }
                                }
                            }
                            actionParameters.references = references;
                            var msg = action;
                            console.log('msg', utils.showJSON(msg));
                            var msgString = JSON.stringify(msg);
                            MQService.send('actions', msgString);
                        }
                    }
                }
            }
            
            return oRes;
        } else {
            console.log('err', oRes);
            return oRes;
        }
    }
};

module.exports = objectService;