'use strict';

var classQuery = require('../models/classQuery');
var objectQuery = require('../models/objectQuery');

var objectModel = {

    create: async function(objectData) {
        logger.log('objectModel.create', {type: 'function'});
        
        let result;
        let neo4jSession = neo4jDriver.session();
        const txc = neo4jSession.beginTransaction();
        const query = objectQuery.create(objectData);
        
        try {
            result = await txc.run(query);
            await txc.commit();
        } catch (error) {
            result = error;
            await txc.rollback();
        } finally {
            await neo4jSession.close();
            return neo4jUtils.formatRecord(result.records[0], {singleRecord: true});
        }
    },
    
    update: function(oldObjectData, objectData, classData, success, error) {
        logger.log('objectModel.update', {type: 'function'});
        
        var query = objectQuery.update(oldObjectData, objectData, classData);
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
                    error(err);
                }
            })
        ;
    },
    
    updateFields: function(params, success, error) {
        logger.log('objectModel.updateFields', {type: 'function'});
        
        var neo4jSession = neo4jDriver.session();
        var query = '';
        
        query += 'MATCH (n:' + params.classLabel + ') WHERE ID(n)=' + params.id + ' ';
        for (var fk in params.fields) {
            var value;
            console.log('fk', fk);
            console.log('params.fields[fk]', params.fields[fk]);
            console.log('typeof params.fields[fk]', typeof params.fields[fk]);
            if (typeof params.fields[fk] === 'object' && (params.fields[fk].constructor === Object || 
                (params.fields[fk].constructor === Array && params.fields[fk].length > 0 && typeof params.fields[fk][0] === 'object'))) {
                value = JSON.stringify(params.fields[fk]);
            } else {
                value = params.fields[fk];
            }
            
            query += 'SET n.' + fk + ' = ' + utils.formatField(value) + ' ';
        }
        query += 'RETURN ID(n)';
        
        console.log('query', query);
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var item = utils.getDbItem(res);
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            })
        ;
    },
    
    find2: function(params, success, error) {
        logger.log('objectModel.find2', {type: 'function'});
        var list = [];
        var errors;
        var neo4jSession = neo4jDriver.session();
        var getClassQuery = classQuery.get2();
        var getClassTxPromise = neo4jSession.readTransaction(tx =>
            tx.run(getClassQuery, { classId: params.filter.classId })
        );

        getClassTxPromise.then(classData => {
            console.log('classData', classData);
            var finObjectQuery = objectQuery.find2(classData);
            var findObjectTxPromise = neo4jSession.readTransaction(tx =>
                tx.run(findObjectQuery, { params: params })
            );

            session.close()

            if (result) {
                console.log('Person created')
            }
        });
    },
    
    find: function(classData, params, success, error) {
        logger.log('objectModel.find', {type: 'function'});
        // console.log('params', params.filterObject.conditions);
        // console.log('params', params);
        var query = objectQuery.find(classData, params);
        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var fieldsRaw = utils.getDbItemArray(data);
                    var fields = [];
                    var fai = 0;
                    
                    for (var i=0;i<classData.list.fields.length;i++) {
                        var fs = classData.list.fields[i].key.split('.');
                        if (fs[0] === '$connections') {
                            var fd = {
                                id: fieldsRaw[fai],
                                name: fieldsRaw[fai + 1]
                            };
                            
                            fields.push(fd);
                            fai++;
                        } else {
                            fields.push(fieldsRaw[fai]);
                        }
                        
                        fai++;
                    }
                    
                    if (fields.length < fieldsRaw.length) {
                        for (var i=fai;i<fieldsRaw.length;i++) {
                            fields.push(fieldsRaw[i]);
                        }
                    }

                    var item = {
                        fields: fields,
                        _actions: 'rud'
                    };
                    console.log('FOUND item \n', item);
                    
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
    
    findForEdge: function(params, success, error) {
        logger.log('objectModel.findForEdge', {type: 'function'});
        var query = objectQuery.findForEdge(params);
        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = {
                        id: data._fields[0].low,
                        name: data._fields[1],
                        _actions: 'rud'
                    };
                    
                    list.push(item);
                },
                onCompleted: function () {
                    console.log('List data', list);
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
    
    findByClasses: function(params, success, error) {
        logger.log('objectModel.findByClasses', {type: 'function'});
        var query = objectQuery.findByClasses(params.classes);

        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    // console.log('FOUND data', data);
                    var item = {
                        id: data._fields[0].low,
                        name: data._fields[1],
                        label: data._fields[2],
                        _actions: 'rud'
                    };
                    
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
    
    getExistingConnections: function(params, success, error) {
        logger.log('objectModel.getExistingConnections', {type: 'function'});
        
        var list = [];
        var query = objectQuery.getExistingConnections(params, {multipleOnly: true});
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = utils.getDbItem(data);
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            })
        ;
    },
    
    // transform: function(object) {
        // for (var property in object) {
            // if (object.hasOwnProperty(property)) {
                // var propertyValue = object[property];
                // if (isInt(propertyValue)) {
                    // object[property] = propertyValue.toString();
                // } else if (typeof propertyValue === 'object') {
                    // transform(propertyValue);
                // }
            // }
        // }
    // },
    
    get: function(params, success, error) {
        logger.log('objectModel.get', {type: 'function'});
        var query = objectQuery.get(params);
        var classData = params['class'];
        var neo4jSession = neo4jDriver.session();

        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = utils.getDbItem(data);
                    console.log('item', item);
                    var o = {
                        id: item.id,
                        classId: item.classId,
                        fields: {},
                        connections: {}
                    };
                    
                    // Format items
                    for (var ik in item) {
                        var iks = ik.split('.');
                        if (iks.length === 2) {
                            o.fields[iks[1]] = item[ik];
                        } else 
                        if (iks.length === 3) {
                            if (o.connections[iks[1]] === undefined) {
                                o.connections[iks[1]] = {};
                            }
                            
                            o.connections[iks[1]][iks[2]] = item[ik];
                        }
                    }
                    
                    console.log('o', o);
                    success(o);
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

    delete: function(params, success, error) {
        logger.log('objectModel.delete', {type: 'function'});
        var query = objectQuery.delete(params);
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
    },
    
    // Async/await test
    getConnectedClasses: function(classData, fields, success, error) {
        logger.log('objectModel.getConnectedClasses', {type: 'function'});
        
        var query = objectQuery.delete(params);
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

module.exports = objectModel;