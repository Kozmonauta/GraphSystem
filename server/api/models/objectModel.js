'use strict';

var objectCreateQuery = require('../models/objectCreateQuery');
var objectReadQuery = require('../models/objectReadQuery');
var objectUtils = require('../models/objectUtils');
var neo4jUtils = require('../neo4jUtils');

var objectModel = {

    create: async function(objectData, classData) {
        logger.log('objectModel.create', {type: 'function'});
        
        const nodesToCheck = objectUtils.getNodesToCheck(objectData, classData);
        const caeQuery = objectCreateQuery.checkAvailableEdges(nodesToCheck);
        const neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();

        try {
            // Check the available edges of the connected nodes
            const caeResultRaw = await txc.run(caeQuery);
            // TODO handle all wrong cases
            if (caeResultRaw.records.length === 0) {
                throw new Error('Wrong connections');
            }
            
            const caeResult = neo4jUtils.formatRecord(caeResultRaw.records[0]);

            let connectedSubNodes = {};
            for (let fk in caeResult) {
                const fieldName = fk.substring(fk.indexOf('.') + 1);
                const fieldNamePrefix = fieldName.substring(0,3);
                const fieldNameValue = fieldName.substring(3);
                
                if (fieldNamePrefix === 'oe_' || fieldNamePrefix === 'ie_') {
                    if (caeResult[fk] === null || caeResult[fk] === 0) {
                        throw new Error('No available connections');
                    }
                } else
                if (fieldNamePrefix === 'ni_') {
                    if (caeResult[fk] !== null) {
                        connectedSubNodes[fieldNameValue] = { id: caeResult[fk] };
                    }
                }
            }
            
            const nodesToUpdate = objectUtils.getNodesToUpdate(nodesToCheck, caeResult);
            
            // Update the available edges of the connected nodes
            if (Object.keys(nodesToUpdate).length > 0) {
                const uaeQuery = objectCreateQuery.updateAvailableEdges(nodesToUpdate);
                const uaeResult = await txc.run(uaeQuery);
            }
            
            const createQuery = objectCreateQuery.create(objectData, classData, connectedSubNodes);
            const createResultRaw = await txc.run(createQuery);
            const createResult = neo4jUtils.formatRecord(createResultRaw.records[0]);
            // console.log('createResult', createResult);
            const createResultFormatted = objectUtils.formatCreateResult(createResult);
            // console.log('createResultFormatted', utils.showJSON(createResultFormatted));
            await txc.commit();
            return createResultFormatted;
        } catch (e) {
            await txc.rollback();
            throw e;
        } finally {
            await neo4jSession.close();
        }
    },
    
    get: async function(params, c) {
        logger.log('objectModel.get', {type: 'function'});

        const query = objectReadQuery.get(params, c);
        const neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();

        try {
            const resultRaw = await txc.run(query);
            let result = neo4jUtils.formatRecord(resultRaw.records[0]);
            // console.log('result', result);
            let resultFormatted = objectUtils.formatGetResult(result);
            // console.log('resultFormatted', resultFormatted);
            
            await txc.commit();
            return resultFormatted;
        } catch (e) {
            await txc.rollback();
            throw e;
        } finally {
            await neo4jSession.close();
        }
    },
        
    findByEdge: async function(destinationEdge) {
        logger.log('objectModel.findByEdge', {type: 'function'});

        const query = objectReadQuery.findByEdge(destinationEdge);
        const neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();

        try {
            const resultRaw = await txc.run(query);
            let result = neo4jUtils.formatRecords(resultRaw.records, {singleRecord: true});
            // console.log('result', utils.showJSON(result));
            for (let i=0; i<result.length; i++) {
                const r = result[i];
                
                let subEdges = {};
                let node = {
                    labels: r.labels,
                    id: r.id
                };

                if (r.fields.name !== undefined) node.name = r.fields.name;
                
                for (let fk in r.fields) {
                    const fieldPrefix = fk.substr(0,3);
                    const fieldType = fk.substr(3);
                    const edgeDirection = fieldPrefix.substr(0,1);
                    // console.log('fieldPrefix', fieldPrefix);
                    // console.log('fieldType', fieldType);
                    
                    if (fieldType === destinationEdge.type && 
                        ((edgeDirection === 'i' && destinationEdge.direction === 'in') || 
                        (edgeDirection === 'o' && destinationEdge.direction === 'out'))) {
                        // find field keys like "ie_HAS" or "oe_CONTROLS"
                        if (fieldPrefix === 'ie_' || fieldPrefix === 'oe_') {
                            node.availableEdgeNumber = r.fields[fk];
                        } else
                        // find field keys like "in_HAS" or "on_CONTROLS"
                        if (fieldPrefix === 'in_' || fieldPrefix === 'on_') {
                            let edgeKeys = r.fields[fk];
                            
                            for (let j=0; j<edgeKeys.length; j++) {
                                const ek = edgeKeys[j];
                                const nnField = 'nn_' + ek;
                                subEdges[ek] = r.fields[nnField];
                            }
                        }                        
                    }
                }
                
                if (Object.keys(subEdges).length > 0) node.subEdges = subEdges;
                
                // console.log('node', utils.showJSON(node));
                result[i] = node;
            }
                
            await txc.commit();
            return result;
        } catch (e) {
            await txc.rollback();
            throw e;
        } finally {
            await neo4jSession.close();
        }
    }
    
};

module.exports = objectModel;