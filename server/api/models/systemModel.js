'use strict';

var systemQuery = require('../models/systemQuery');

var systemModel = {

    create: async function(classes, objects) {
        logger.log('systemModel.create', {type: 'function'});

        for (var cn in classes) {
            classes[cn].definer = "$core";
            
            if (classes[cn].name === undefined) {
                classes[cn].name = classes[cn].label;
            }
            if (classes[cn].fields !== undefined) {
                classes[cn].fields = JSON.stringify(classes[cn].fields);
            }
            if (classes[cn].edges !== undefined) {
                classes[cn].edges = JSON.stringify(classes[cn].edges);
            }
        }
        
        var query = systemQuery.create(classes, objects);
            console.log("query", query);

        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        
        try {
            result = await txc.run(query);
            console.log("system.create success");
            await txc.commit();
            return result;
        } catch (error) {
            await txc.rollback();
            console.log("system.create error");
            result = error;
        } finally {
            await neo4jSession.close();
            return result;
        }
    }
    
};

module.exports = systemModel;