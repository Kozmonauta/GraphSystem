'use strict';

var systemQuery = require('../models/systemQuery');
var neo4jUtils = require('../neo4jUtils');

var systemModel = {

    hasCore: async function() {
        logger.log('systemModel.hasCore', {type: 'function'});
        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        const query = systemQuery.getCore();
        
        try {
            result = await txc.run(query);
            await txc.commit();
        } catch (error) {
            result = error;
            await txc.rollback();
        } finally {
            await neo4jSession.close();
            return result.records.length > 0;
        }
    },
    
    getInheritClasses: async function(core) {
        logger.log('systemModel.getInheritClasses', {type: 'function'});
        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        const query = systemQuery.getInheritClasses(core);
        
        try {
            result = await txc.run(query);
            await txc.commit();
        } catch (error) {
            result = error;
            await txc.rollback();
        } finally {
            await neo4jSession.close();
            return neo4jUtils.formatRecords(result.records, {singleRecord: true});
        }
    },
    
    createCore: async function() {
        logger.log('systemModel.createCore', {type: 'function'});
        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        const query = systemQuery.createCore();

        try {
            result = await txc.run(query);
            await txc.commit();
        } catch (error) {
            result = error;
            await txc.rollback();
        } finally {
            await neo4jSession.close();
            let core = {id: neo4jUtils.formatRecord(result.records[0], {singleRecord: true})};
            // console.log("Result: ", util.inspect(result, {showHidden: false, depth: null}));
            return core;
        }
    },
    
    createClasses: async function(classes, core) {
        logger.log('systemModel.createClasses', {type: 'function'});
        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        const query = systemQuery.createClasses(classes, core);

        try {
            result = await txc.run(query);
            await txc.commit();
        } catch (error) {
            await txc.rollback();
            result = error;
        } finally {
            await neo4jSession.close();
            return neo4jUtils.formatRecord(result.records[0]);
        }
    },
    
    createObjects: async function(objects) {
        logger.log('systemModel.createObjects', {type: 'function'});

        var query = systemQuery.createObjects(objects);
        console.log("query", query);

        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        
        try {
            result = await txc.run(query);
            await txc.commit();
            console.log("Database operation success");
        } catch (error) {
            await txc.rollback();
            result = error;
            console.log("Database operation error");
        } finally {
            await neo4jSession.close();
            console.log("Result: ", result);
            return result;
        }
    },
    
    clear: async function() {
        logger.log('systemModel.clear', {type: 'function'});

        var query = systemQuery.clear();
        // console.log("query", query);

        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        
        try {
            result = await txc.run(query);
            await txc.commit();
            // console.log("Database operation success");
        } catch (error) {
            await txc.rollback();
            result = error;
            console.log("Database operation error");
        } finally {
            await neo4jSession.close();
            return result;
        }
    }
    
};

module.exports = systemModel;