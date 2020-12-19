'use strict';

var classQuery = require('../models/classQuery');

var classModel = {

    create: async function(data) {
        logger.log('classModel.create', {type: 'function'});

        // https://neo4j.com/docs/api/javascript-driver/current/
        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        
        try {
            // let currentData = await txc.run(classQuery.getCurrent(data));
            result = await txc.run(classQuery.create(data));
            console.log("model succ");
            await txc.commit();
        } catch (error) {
            await txc.rollback();
            console.log("model err");
            result = error;
        } finally {
            await neo4jSession.close();
            return result;
        }
    },
    
    update: function(data, success, error) {
        logger.log('classModel.update', {type: 'function'});
        
        var query = classQuery.update(data);
        var neo4jSession = neo4jDriver.session();
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    // console.log('success', data);
                    success(data);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            });
    },
    
    find: function(params, success, error) {
        logger.log('classModel.find', {type: 'function'});
        
        var query = classQuery.find(params);
        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = utils.getDbItem(data, {keyLeftTrim:2});
                    item._actions = 'rud';
                    list.push(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                    if (errors === undefined) {
                        success(list);
                    } else {
                        error(errors);
                    }
                },
                onError: function (err) {
                    errors = err;
                    error(errors);
                }
            })
        ;
    },

    get: function(filter, options, success, error) {
        logger.log('classModel.get', {type: 'function'});
        
        var query = classQuery.get(filter, options);
        var neo4jSession = neo4jDriver.session();
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    // console.log('GETTTTTTO data:', data);
                    var item = utils.getDbItem(data, {keyLeftTrim:2});
                    // console.log('item:', item);
                    
                    if (item.edges !== undefined) item.edges = JSON.parse(item.edges);
                    if (item.fields !== undefined) item.fields = JSON.parse(item.fields);
                    if (item.form !== undefined) item.form = JSON.parse(item.form);
                    if (item.filter !== undefined) item.filter = JSON.parse(item.filter);
                    if (item.list !== undefined) item.list = JSON.parse(item.list);
                    
                    if (item.containerId !== undefined) {
                        item.container = {
                            id: item.containerId,
                            name: item.containerName
                        };
                    }
                    
                    delete item.containerId;
                    delete item.containerName;
                    
                    item._actions = 'rud';
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    },

    findByIds: function(ids, success, error) {
        logger.log('classModel.findByIds', {type: 'function'});

        var query = '';
        query += 'MATCH (n:Class) ';
        query += 'WHERE ID(n) IN ' + utils.formatField(ids) + ' ';
        query += 'RETURN ID(n), n.name, n.label';

        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        // console.log('query', query);
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = {
                        id: data._fields[0].low,
                        name: data._fields[1],
                        actions: 'rud'
                    };
                    
                    list.push(item);
                },
                onCompleted: function () {
                    // console.log('list', list);
                    // console.log('errors', errors);
                    neo4jSession.close();
                    if (errors === undefined) {
                        success(list);
                    } else {
                        error(errors);
                    }
                },
                onError: function (err) {
                    errors = err;
                    error(errors);
                }
            })
        ;
    },
    
    getLabels: function(ids, success, error) {
        logger.log('classModel.getLabels', {type: 'function'});
        var query = '';
        var list = [];
        var errors;
        // console.log('class model get', filter);
        
        query += 'MATCH (n:Class) WHERE ID(n) IN ' + utils.formatField(ids) + ' ';
        query += 'RETURN ID(n) AS id, n.name AS name, n.label AS label';

        console.log('class query', query);

        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = utils.getDbItem(data);
                    console.log('item', item);
                    item.actions = 'rud';
                    list.push(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                    if (errors === undefined) {
                        success(list);
                    } else {
                        error(errors);
                    }
                },
                onError: function (err) {
                    errors = err;
                }
            })
        ;
    },

    delete: function(filter, success, error) {
        logger.log('classModel.delete', {type: 'function'});
        var query = '';
        query += 'MATCH (n:Class) ';
        query += 'WHERE ID(n) = ' + filter.id + ' ';
        // @TODO This can cause isolated nodes
        query += 'DETACH DELETE n RETURN true';

        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    // console.log('Deleted successfully', data);
                    success(data);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    },
    
    deleteMass: function(ids, success, error) {
        logger.log('classModel.deleteMass', {type: 'function'});
        var query = '';
        query += 'MATCH (n:Class) WHERE ID(n) = ' + id + ' ';
        query += 'DETACH DELETE n RETURN true';

        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    success(data);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    }
    
};

module.exports = classModel;