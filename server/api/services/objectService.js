var classModel = require('../models/classModel');
var objectModel = require('../models/objectModel');
var util = require('util');

var objectService = {
    
    create: async function(o) {
        logger.log('objectService.create', {type: 'function'});
        // console.log('object', o);
        
        if (typeof o['class'] === 'string') {
            o['class'] = await classModel.get(o['class']);
        }
        // console.log('class', o['class'].name);
        
        var now = new Date().getTime();
        o.fields._classId = o['class'].id;
        o.fields._createdOn = new Date().getTime();
        o.fields._creator = ".";
        
        await objectModel.create(o)
            .then(res => {
                var actions = o.actions;
                if (actions !== undefined) {
                    var createSuccessActions = actions['create.success'];
                    if (createSuccessActions !== undefined) {
                        for (var k in createSuccessActions) {
                            var action = createSuccessActions[k];
                            console.log('triggered action:', action);
                            if (action.action === 'createObject') {
                                var actionParameters = action.parameters;
                                if (actionParameters.edges !== undefined) {
                                    for (ek in actionParameters.edges) {
                                        var e = actionParameters.edges[ek];
                                        if (e.endpoint === '$parent') {
                                            e.endpoint = {
                                                "id": res.fields.id
                                            }
                                        }
                                    }
                                }
                                var msg = action;
                                var msgString = JSON.stringify(msg);
                                MQService.send('actions', msgString);
                            }
                        }
                    }
                }
                
                return res;
            }, err => {
                console.log('err', err);
                return err;
            })
        ;
    }
    
};

module.exports = objectService;