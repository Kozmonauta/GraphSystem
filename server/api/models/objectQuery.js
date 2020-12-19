'use strict';

var objectQuery = {

    add: function(objectData, classData) {
        logger.log('objectQuery.add', {type: 'function'});
        logger.log(objectData, {name: 'objectData'});
        // logger.log(classData, {name: 'classData'});
        
        var query = '';
        var nodeFields = this.parseNodeFields(classData, objectData);
        
        for (var ok in objectData.connections) {
            // @TODO handle if c.multiple === true => error
            var connected = classData.connections[ok].connected;
            
            if (connected !== undefined && connected.classLabel !== undefined) {
                query += 'MATCH (n_' + ok + ':' + connected.classLabel + ') WHERE ID(n_' + ok + ') = ' + objectData.connections[ok] + ' ';
            } else {
                query += 'MATCH (n_' + ok + ') WHERE ID(n_' + ok + ') = ' + objectData.connections[ok] + ' ';
            }
        }
        
        query += 'CREATE (n:' + classData.label + nodeFields + ') ';

        for (var ok in objectData.connections) {
            var c = classData.connections[ok];
            
            query += 'CREATE (n)';
            
            if (c.direction === 'out') 
                query += '-[e_' + ok + ':' + c.label + ']->(n_' + ok + ') ';
            else if (c.direction === 'in') 
                query += '<-[e_' + ok + ':' + c.label + ']-(n_' + ok + ') ';
            ;
        }

        query += 'RETURN true';
        
        logger.log(query, {name: 'query'});

        return query;
    },
    
    update: function(oldObjectData, objectData, classData) {
        logger.log('objectQuery.update', {type: 'function'});

        var query = '';
        var newNodes = [];
        for (var ck in objectData.connections) {
            // console.log('ck', ck);
            // console.log('ock', objectData.connections[ck]);
            // console.log('cck', classData.connections[ck]);
            newNodes.push({
                id: parseInt(objectData.connections[ck]),
                key: ck,
                label: classData.connections[ck].connected !== undefined ? classData.connections[ck].connected.classLabel : undefined
            });
        }
        
        query += this.get({'class': classData, id: objectData.id, type: 'update', newNodes: newNodes});
        
        query += 'SET n._ies = ' + utils.formatField(objectData._ies) + ' ';
        query += 'SET n._oes = ' + utils.formatField(objectData._oes) + ' ';
        
        for (var fk in objectData.fields) {
            var f = objectData.fields[fk];
            if (classData.fields[fk].textType !== 'password' || !utils.isEmpty(f)) {
                query += 'SET n.' + fk + ' = ' + utils.formatField(f) + ' ';
            }
        }
        
        for (var ck in objectData.connections) {
            var c = objectData.connections[ck];
            var cc = classData.connections[ck];
            // console.log('-- c', c);
            // console.log('-- cc', cc);
            
            query += 'DELETE e_' + ck + ' ';
            
            if (cc.direction === 'out') {
                query += 'CREATE (n)-[e2_' + ck + ':' + cc.label + ']->(nn_'+ ck + ') ';
            } else 
            if (cc.direction === 'in') {
                query += 'CREATE (n)<-[e2_' + ck + ':' + cc.label + ']-(nn_'+ ck + ') ';
            }
        }
        
        query += 'RETURN ID(n)';
            // console.log('query', query);
        
        logger.log(query, {name: 'query'});

        return query;
    },
    
    get: function(params) {
        logger.log('objectQuery.get', {type: 'function'});
        logger.log(params, {name: 'params'});
        
        // Info: Graph data structure, where an optional edge is followed by a required one, is not supported
        
        var classData = params['class'];
        var objectId = params.id;
        var newNodes = params.newNodes;

        var query = 'MATCH (n:' + classData.label + ') ';
        query += 'WHERE ID(n) = ' + objectId + ' ';
        
        if (newNodes !== undefined) {
            for (var i=0;i<newNodes.length;i++) {
                if (newNodes[i].label !== undefined) {
                    query += 'MATCH (nn_' + newNodes[i].key + ':' + newNodes[i].label + ') ';
                } else {
                    query += 'MATCH (nn_' + newNodes[i].key + ') ';
                }
                
                query += 'WHERE ID(nn_' + newNodes[i].key + ')=' + newNodes[i].id + ' ';
            }
        }
        
        for (var ck in classData.connections) {
            var c = classData.connections[ck];

            if (utils.isTrue(c.multiple)) continue;

            query += 'OPTIONAL ';
            
            if (c.direction === 'out') {
                if (c.connected !== undefined && c.connected.classLabel !== undefined) {
                    query += 'MATCH (n)-[e_' + ck + ':' + c.label + ']->(n_' + ck + ':' + c.connected.classLabel + ') ';
                } else {
                    query += 'MATCH (n)-[e_' + ck + ':' + c.label + ']->(n_' + ck + ') ';
                }
            } else 
            if (c.direction === 'in') {
                if (c.connected !== undefined && c.connected.classLabel !== undefined) {
                    query += 'MATCH (n)<-[e_' + ck + ':' + c.label + ']-(n_' + ck + ':' + c.connected.classLabel + ') ';
                } else {
                    query += 'MATCH (n)<-[e_' + ck + ':' + c.label + ']-(n_' + ck + ') ';
                }
            }
        }
        
        if (params.type === 'update') return query;
        
        query += 'RETURN ';
        query += 'ID(n) AS id,';
        query += 'n._classId AS classId,';
        
        for (var fk in classData.fields) {
            query += 'n.' + fk + ' AS `n.' + fk + '`,';
        }
        
        for (var ck in classData.connections) {
            if (utils.isTrue(classData.connections[ck].multiple)) continue;
            
            query += 'ID(n_' + ck + ') AS `n.' + ck + '.id`,';
            query += 'n_' + ck + '.name AS `n.' + ck + '.name`,';
        }
        
        // q = 'RETURN n.name AS name';
        // q = 'RETURN ID(n) AS `n.id`, parent.name AS `parent.name`, ID(parent) AS `parent.id`';
        
        query = query.slice(0, -1);

        logger.log(query, {name: 'query'});
        
        return query;
    },
    
    find: function(classData, params) {
        logger.log('objectQuery.find', {type: 'function'});
        
        var query = '';
        var conditions = params.filter.conditions;
        var returnMode = params.mode !== undefined ? params.mode : 'list';
        // Collect the required connections
        var matchKeys = {};
        var optionalMatchKeys = {};
        var sort;
        var fields;
        var aggregation = false;
        
        if (params.list !== undefined) {
            if (params.list.sort !== undefined) {
                sort = params.list.sort;
            }
            
            if (params.list.fields !== undefined) {
                fields = params.list.fields;
            }
        }
        
        if (fields === undefined) fields = classData.list.fields;
        
        query += 'MATCH (n:' + classData.label + ') ';
        query += 'WHERE n._classId = ' + classData.id + ' ';
        
        if (conditions !== undefined) {
            for (var i=0;i<conditions.length;i++) {
                var operation = Object.keys(conditions[i])[0];
                var fs = conditions[i][operation][0].split('.');
                
                if (fs[0] === '$fields') {
                    query += 'AND ' + this.addCondition('n.' + fs[1], conditions[i][operation][1], operation);
                } else {
                    if (matchKeys[fs[1]] === undefined) matchKeys[fs[1]] = [];
                    
                    matchKeys[fs[1]].push(conditions[i]);
                }
            }
        }
        
        // MATCH connections
        for (var ck in matchKeys) {
            var c = classData.connections[ck];
            
            if (utils.isTrue(c.multiple)) continue;

            query += this.getConnection(c, matchKeys[ck]);
        }
        
        for (var ck in classData.connections) {
            var c = classData.connections[ck];

            if (matchKeys[ck] !== undefined || utils.isTrue(c.multiple)) continue;
            
            query += 'OPTIONAL ';
            query += this.getConnection(c);
        }
        
        query += 'RETURN ';

        if (fields !== undefined) {
            for (var fk in fields) {
                var fieldKey = fields[fk].key;
                var fks = fieldKey.split('.');

                if (fks[0] === '$connections') {
                    if (fks.length === 2) {
                        if (utils.isTrue(classData.connections[fks[1]].multiple)) {
                            query += '"" AS `' + fks[1] + '.id`,';
                            query += '"" AS `' + fks[1] + '.name`,';
                        } else {
                            if (fields[fk].aggregation === undefined) {
                                query += 'ID(n_' + fks[1] + ') AS `' + fks[1] + '.id`,';
                                query += 'n_' + fks[1] + '.name AS `' + fks[1] + '.name`,';
                            } else {
                                aggregation = true;
                                
                                switch (fields[fk].aggregation) {
                                    case 'count':
                                            query += 'COUNT(n_' + fks[1] + ') AS `' + fks[1] + '.id`,';
                                            query += '"" AS `' + fks[1] + '.name`,';
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                } else {
                    if (fields[fk].aggregation === undefined) {
                        query += 'n.' + fks[1] + ' AS ' + fks[1] + ',';
                    } else {
                        aggregation = true;
                        
                        switch (fields[fk].aggregation) {
                            case 'count':
                                query += 'COUNT(n.' + fks[1] + ') AS ' + fks[1] + ',';
                                break;
                            case 'sum':
                                query += 'SUM(n.' + fks[1] + ') AS ' + fks[1] + ',';
                                break;
                            case 'avg':
                                query += 'AVG(n.' + fks[1] + ') AS ' + fks[1] + ',';
                                break;
                            case 'min':
                                query += 'MIN(n.' + fks[1] + ') AS ' + fks[1] + ',';
                                break;
                            case 'max':
                                query += 'MAX(n.' + fks[1] + ') AS ' + fks[1] + ',';
                                break;
                            default:
                                query += 'n.' + fks[1] + ' AS ' + fks[1] + ',';
                                break;
                        }
                    }
                }
            }
            
            if (aggregation === true) {
                query = query.slice(0, -1);
            } else {
                query += 'ID(n) AS id ';
            
                if (sort !== undefined) {
                    query += 'ORDER BY ';
                    
                    for (var i=0;i<sort.length;i++) {
                        var fks = sort[i].split('.');
                        var sort = fks[0].charAt(0);
                        var fk = fks[0].substr(1);
                        
                        if (fk === '$connections') {
                            if (fks.length === 2) {
                                query += 'ID(n_' + fks[1] + '),';
                            } else 
                            if (fks.length === 3) {
                                query += 'n_' + fks[1] + '.' + fks[2] + ',';
                            }
                        } else {
                            query += 'n.' + fks[1];
                            if (sort === '-') {
                                query += ' DESC';
                            }
                            query += ',';
                        }
                    }
                    
                    query = query.slice(0, -1);
                }
            }
        }
        
        
        logger.log(query, {name: 'query'});

        return query;
    },
    
    getConnection: function(c, conditions) {
        var query = '';
        var ck = c.key;
console.log('c',c);
        if (c.direction === 'out') {
            if (c.connected !== undefined && c.connected.classLabel !== undefined) {
                query += 'MATCH (n)-[e_' + ck + ':' + c.label + ']->(n_' + ck + ':' + c.connected.classLabel + ') ';
            } else {
                query += 'MATCH (n)-[e_' + ck + ':' + c.label + ']->(n_' + ck + ') ';
            }
        } else 
        if (c.direction === 'in') {
            if (c.connected !== undefined && c.connected.classLabel !== undefined) {
                query += 'MATCH (n)<-[e_' + ck + ':' + c.label + ']-(n_' + ck + ':' + c.connected.classLabel + ') ';
            } else {
                query += 'MATCH (n)<-[e_' + ck + ':' + c.label + ']-(n_' + ck + ') ';
            }
        }
        
        if (conditions !== undefined) {
            query += 'WHERE TRUE ';
            
            for (var i=0;i<conditions.length;i++) {
                var operation = Object.keys(conditions[i])[0];
                
                if (conditions[i][operation][1] === undefined) continue;
                
                var fks = conditions[i][operation][0].split('.');
                
                if (fks.length === 2) {
                    query += 'AND ' + this.addCondition('ID(n_' + fks[1] + ')', conditions[i][operation][1], operation);
                } else 
                if (fks.length === 3) {
                    query += 'AND ' + this.addCondition('n_' + fks[1] + '.' + fks[2], conditions[i][operation][1], operation);
                }
            }
        }
        
        return query;
    },
    
    addCondition: function(p1, p2, operation) {
        var query = '';
        
        switch (operation) {
            case 'e':
                query += p1 + ' = ' + utils.formatField(p2) + ' ';
                break;
            case 'g':
                query += p1 + ' > ' + utils.formatField(p2) + ' ';
                break;
            case 'ge':
                query += p1 + ' >= ' + utils.formatField(p2) + ' ';
                break;
            case 'l':
                query += p1 + ' < ' + utils.formatField(p2) + ' ';
                break;
            case 'le':
                query += p1 + ' <= ' + utils.formatField(p2) + ' ';
                break;
            case 'c':
                // @TODO if type = string
                query += p1 + ' =~ \'(?i).*' + p2 + '.*\' ';
                break;
        }
        
        return query;
    },
    
    find2: function(classData) {
        logger.log('objectQuery.find2', {type: 'function'});
        // logger.log(params.connections, {name: 'params'});
        
        var query = '';
        
        q += 'MATCH (n:' + classData.label + ') ';
        q += 'WHERE n._classId = ' + classData.id + ' ';
        query += 'RETURN ';

        if (classData.list !== undefined && classData.list.fields !== undefined) {
            for (var fk in classData.list.fields) {
                var fieldKey = classData.list.fields[fk].key;
                var fks = fieldKey.split('.');
                query += 'n.' + fks[1] + ' AS ' + fks[1] + ',';
            }
            
            query += 'ID(n) AS id';
        }
        
        logger.log(query, {name: 'query'});

        return query;
    },
    
    // Search for objects, filter by edge
    // 
    // Available parameters:
    // ed: edgeDirection *
    // el: edgeLabel *
    // nci: nodeClassId
    // ncl: nodeClassLabel
    // cci: connectedNodeClassId
    findForEdge: function(params) {
        logger.log('objectQuery.findForEdge', {type: 'function'});
        logger.log(params, {name: 'params'});
        
        var query = '';
        var classData = params.classData;
        var ed = params.ed;
        var el = params.el;
        var nci = params.nci;
        var ncl = params.ncl;
        var cci = params.cci;
        var nes;
        var ces;
        var nameField;

        nes = ed === 'out' ? '_oes' : '_ies';
        ces = ed === 'out' ? '_ies' : '_oes';
        
        // If class has "name" field then return that, else return first text field
        if (classData === undefined || (classData.fields.name !== undefined && classData.fields.name.type === 'text')) {
            nameField = 'name';
        } else {
            for (var fk in classData.fields) {
                var field = classData.fields[fk];
                
                if (field.type === 'text') {
                    nameField = fk;
                    break;
                }
            }
        }
        
        if (nci !== undefined && ncl !== undefined && cci !== undefined) {
            query += 'MATCH (n:' + ncl + ') WHERE ';
            query += 'n._classId = ' + nci + ' AND ';
            query += '("' + el + '" IN n.' + nes + ' OR ';
            query += '"' + el + '.' + cci + '" IN n.' + nes + ') ';
            query += 'RETURN ';
            query += 'ID(n) AS id, n.' + nameField + ' AS ' + nameField + ';';
        } else 
            
        if (ncl !== undefined && cci !== undefined && nci === undefined) {
            query += 'MATCH (n:' + ncl + ') WHERE ';
            query += '("' + el + '" IN n.' + nes + ' OR ';
            query += '"' + el + '.' + cci + '" IN n.' + nes + ') ';
            query += 'RETURN ';
            query += 'ID(n) AS id, n.' + nameField + ' AS ' + nameField + ';';
        } else 
            
        if (cci !== undefined && nci === undefined && ncl === undefined) {
            query += 'MATCH (n) WHERE ';
            query += '("' + el + '" IN n.' + nes + ' OR ';
            query += '"' + el + '.' + cci + '" IN n.' + nes + ') ';
            query += 'RETURN ';
            query += 'ID(n) AS id, n.' + nameField + ' AS ' + nameField + ';';
        } else
            
        if (cci === undefined && nci === undefined && ncl === undefined) {
            query += 'MATCH (n) WHERE ';
            query += '"' + el + '" IN n.' + nes + ' ';
            query += 'RETURN ';
            query += 'ID(n) AS id, n.' + nameField + ' AS ' + nameField + ';';
        // } else
            
        // if (ncl !== undefined && cci === undefined && nci === undefined) {
            // query += 'MATCH (n:' + ncl + ') WHERE ';
            // query += '"' + el + '" IN n.' + nes + ' ';
            // query += 'RETURN ';
            // query += 'ID(n) AS id, n.' + nameField + ' AS ' + nameField + ';';
        }
            
        logger.log(query, {name: 'query'});

        return query;
    },
    
    findByClasses: function(classes) {
        logger.log('objectQuery.findByClasses', {type: 'function'});
        // logger.log(classes, {name: 'classes'});
        
        var query = '';
        var edgesDone= [];
        var nodesDone = [];
        
        for (var c in classes) {
            if (query !== '') {
                query += 'UNION ';
            }
            
            var id = classes[c].id;
            var label = classes[c].label;
            
            if (label !== undefined) {
                query += 'MATCH (n_' + c + ':' + label + ') ';
            } else {
                query += 'MATCH (n_' + c + ') ';
            }
            query += 'WHERE n_' + c + '._classId = "' + id + '" ';
            query += 'RETURN ID(n_' + c + ') AS id, n_' + c + '.name AS name, n_' + c + '.label AS label ';
        }
            
        logger.log(query, {name: 'query'});

        return query;
    },
    
    //********************** private methods **********************//
    
    getConditionsForExternalNode: function(edgeKey, params) {
        if (params.conditions === undefined || params.conditions.length === 0 || params['class'] === undefined) return '';

        var conditions = params.conditions;
        var query = '';
        
        // console.log('GCFEN params', params);
        // console.log('GCFEN conditions', conditions);
        // console.log('GCFEN query', query);

        // delete params.preWord;
        
        // console.log('edgeKey', edgeKey);
        for (var i=0;i<conditions.length;i++) {
            var c = conditions[i];
        // console.log('condi', c);
            // Now always one element
            for (var ck in c) {
                // TODO handle if property is not the first element
                // Property format: [nodeKey].[property]
                var propertyParts = c[ck][0].split('.');
                var propertyKey = propertyParts[1];
                
        // console.log('propertyKey', propertyKey);
                if (propertyKey !== edgeKey) continue;
                
                var value = c[ck][1];
                
                query += params.preWord ? params.preWord + ' ' : ''
                query += 'ID(n_' + propertyKey + '_ep)=' + value + ' ';
            }
        }
        // console.log('GCFEN query 2', query);
        
        return query;
    },
    
    parseNodeFields: function(classData, objectData) {
        // @TODO use classFields?
        var s = '{';
        var _oes = [];
        var _ies = [];

        for (var k in objectData.fields) {
            if (!utils.isEmpty(objectData.fields[k])) {
                s += '' + k + ':';
                s += utils.formatField(objectData.fields[k]);
                s += ',';
            }
        }
        
        // Add _oes, _ies
        for (var k in classData.connections) {
            var c = classData.connections[k];
            
            if (utils.isTrue(c.multiple)) {
                var connected = c.label;
                
                if (c.connected !== undefined && c.connected.classId !== undefined) connected += ('.' + c.connected.classId);
                if (c.direction === 'out') {
                    _oes.push(connected);
                } else 
                if (c.direction === 'in') {
                    _ies.push(connected);
                }
            }
        }
        
        s += '_oes:' + utils.formatField(_oes) + ',';
        s += '_ies:' + utils.formatField(_ies) + ',';
        
        if (s.length > 1) s = s.slice(0, -1);
        
        s += '}';
        
        return s;
    },
    
    delete: function(params) {
        logger.log('objectQuery.delete', {type: 'function'});
        
        var classData = params.classData;
        var objectId = params.id;
        
        var queryParams = {
            'class': classData,
            id: objectId,
            type: 'no-return'
        };

        var query = 'MATCH (n:' + classData.label + ') ';
        query += 'WHERE ID(n) = ' + objectId + ' ';
        query += 'DETACH DELETE n '
        query += 'RETURN true';

        logger.log(query, {name: 'query'});

        return query;
    },
    
    getExistingConnections: function(params, options) {
        if (options === undefined) options = {};
        
        logger.log('objectQuery.getExistingConnections', {type: 'function'});
        
        var objectId = params.id;
        var classData = params.classData;
        var query = '';
        var matchFound = false;
        
        query += 'MATCH (n:' + classData.label + ') ';
        query += 'WHERE ID(n) = ' + objectId + ' ';
        query += 'RETURN ';

        for (var ck in classData.connections) {
            var c = classData.connections[ck];
            
            if (options.multipleOnly !== true || utils.isTrue(c.multiple)) {
                query += 'EXISTS(';
                
                if (c.direction === 'out') {
                    if (c.connected !== undefined && c.connected.classLabel !== undefined) {
                        query += '(n)-[:' + c.label + ']->(:' + c.connected.classLabel + ')';
                    } else {
                        query += '(n)-[:' + c.label + ']->()';
                    }
                } else 
                if (c.direction === 'in') {
                    if (c.connected !== undefined && c.connected.classLabel !== undefined) {
                        query += '(n)<-[:' + c.label + ']-(:' + c.connected.classLabel + ')';
                    } else {
                        query += '(n)<-[:' + c.label + ']-()';
                    }
                }
                
                query += ') AS ' + ck + ',';
                matchFound = true;
            }
        }
        
        if (matchFound === true) {
            query = query.slice(0, -1);
        } else {
            query += 'false';
        }
        
        logger.log(query, {name: 'query'});

        return query;
    }
    
};

module.exports = objectQuery;