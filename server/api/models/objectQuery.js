'use strict';

var objectQuery = {

    createEdgesForNodes: function(nodes, edges, o, c, mainNodeData, connectedSubNodes) {
        logger.log('objectQuery.createEdgesForNodes', {type: 'function'});
        
        let query = '';
        let newNodes = [];
        let newEdges = [];
console.log('---------');
// console.log('c', utils.showJSON(c));
// console.log('--');
console.log('nodes', nodes);
console.log('--');
console.log('connectedSubNodes', connectedSubNodes);
        
        for (let i=0; i<nodes.length; i++) {
            const nk = nodes[i];
console.log('--');
console.log('nk', nk);
            
            for (let ek in edges) {
                let e = edges[ek];
                
                if (e.target === nk || e.source === nk) {
console.log('ek', ek);
console.log('e', e);
                    let nnk;
                    if (e.target === nk) {
                        nnk = e.source;
                    } else 
                    if (e.source === nk) {
                        nnk = e.target;
                    }
console.log('nnk', nnk);
// TODO Insert id link for connected internal nodes to main node's fields. Hint: let main node creation for last and previously created node ids can be inserted.

                    // If the connected new node is referenced in the edges of the class
                    if (nnk !== undefined) {
                        
                        // If node was not created yet
                        if (!newNodes.includes(nnk)) {
                            let objectFieldsString = '';
                            
                            for (let fk in o.nodes[nnk]) {
                                objectFieldsString += fk + ':' + utils.formatField(o.nodes[nnk][fk]) + ',';
                            }

                            if (nnk === mainNodeData.key) {
                                // store class reference in main node
                                objectFieldsString += 'class:"' + c.id + '",';
                                // edge type + edge direction
                                let edgeMarks = {};
                                
                                // store available class info in main node
                                for (let mek in c.edges) {
                                    let me = c.edges[mek];
                                    if (o.edges[mek] === undefined && (me.source === undefined || me.target === undefined)) {
                                        let acNodeKey;
                                        let direction;
                                        let edgeMarkKey;
                                        
                                        if (me.source === undefined) {
                                            direction = 'i';
                                            if (me.target !== nnk) {
                                                acNodeKey = me.target;
                                            }
                                        } else
                                        if (me.target === undefined) {
                                            direction = 'o';
                                            if (me.source !== nnk) {
                                                acNodeKey = me.source;
                                            }
                                        }
                                        
                                        edgeMarkKey = '_' + direction + '_' + me.type;
                                        
                                        if (me.multiple === true) {
                                            edgeMarks[edgeMarkKey] = -1;
                                        } else {
                                            if (edgeMarks[edgeMarkKey] === undefined) {
                                                edgeMarks[edgeMarkKey] = 1;
                                            } else
                                            if (edgeMarks[edgeMarkKey] > 0) {
                                                edgeMarks[edgeMarkKey]++;
                                            }
                                        }
                                        
                                        if (acNodeKey !== undefined) {
                                            // console.log('add acNodeKey', edgeMarkKey, acNodeKey);
                                            if (mainNodeData.subEdges[edgeMarkKey] === undefined) {
                                                mainNodeData.subEdges[edgeMarkKey] = {};
                                            }
                                            
                                            mainNodeData.subEdges[edgeMarkKey][mek] = {
                                                nodeKey: acNodeKey,
                                                nodeName: c.nodes[acNodeKey].name
                                            };
                                        }
                                    }
                                }
                                
                                for (let ek in edgeMarks) {
                                    objectFieldsString += ek + ':' + edgeMarks[ek] + ',';
                                }
                            }                       
                            
                            objectFieldsString = objectFieldsString.substring(0, objectFieldsString.length - 1);
console.log('c.nodes[nnk]', c.nodes[nnk]);
                            query += 'CREATE (' + nnk + ':' + c.nodes[nnk].label;
                            query += '{id:apoc.create.uuid(),' + objectFieldsString + '})';
                            
                            newNodes.push(nnk);
                        } else {
                            query += 'CREATE (' + nnk + ')';
                        }
                        
                        if (e.target === nk) {
                            query += '-[:' + e.type + ']->(' + nk + ') ';
                        } else 
                        if (e.source === nk) {
                            query += '<-[:' + e.type + ']-(' + nk + ') ';
                        }
                    }
                    
                    newEdges.push(ek);
                }
            }
        }
        
        return {
            query: query,
            nodes: newNodes,
            edges: newEdges
        }
    },
     
    isNodeAliased: function(id, nodes) {
        for (let nk in nodes) {
            if (id === nodes[nk]) return true;
        }
        return false;
    },
    
    create: function(o, c, connectedSubNodes) {
        logger.log('objectQuery.create', {type: 'function'});
        // TODO handle node key corruption
        let query = '';

        let externalNodes = {};
        let eni = 0;
        let nodeAlias;
        let mainNodeData = {
            // edges which are connected to external nodes but not from the main node
            subEdges: {}
        };
        const subNodeAlias = 'esn' + eni;
        
        // Collect & match external nodes
        for (let ek in o.edges) {
            let e = o.edges[ek];
        console.log('eee', e);

            // if edge.target is an external node
            if (e.target !== undefined) {
                if (!this.isNodeAliased(e.target, externalNodes)) {
                    nodeAlias = 'en' + (++eni);
                    externalNodes[nodeAlias] = e.target;
                    query += 'MATCH (' + nodeAlias + ') WHERE ' + nodeAlias + '.id="' + e.target + '" ';
                }
                
                if (e.subEdge !== undefined) {
                    e.target = subNodeAlias;
                } else {
                    e.target = nodeAlias;
                }
            } else 
            // if edge.source is an external node
            if (e.source !== undefined) {
                if (!this.isNodeAliased(e.source, externalNodes)) {
                    nodeAlias = 'en' + (++eni);
                    externalNodes[nodeAlias] = e.source;
                    query += 'MATCH (' + nodeAlias + ') WHERE ' + nodeAlias + '.id="' + e.source + '" ';
                }

                if (e.subEdge !== undefined) {
                    e.source = subNodeAlias;
                } else {
                    e.source = nodeAlias;
                }

                if (c.edges[ek].type === 'H') {
                    mainNodeData.key = c.edges[ek].target;
                }
            }

            if (e.subEdge !== undefined) {
                externalNodes[subNodeAlias] = connectedSubNodes[e.subEdge].id;
                // connectedSubNodes[e.subEdge].alias = subNodeAlias;
                query += 'MATCH (' + subNodeAlias + ') WHERE ' + subNodeAlias + '.id="' + connectedSubNodes[e.subEdge].id + '" ';
            }
        }
        
        console.log('externalNodes', externalNodes);
        let nodes = [];
        // TODO consider possible node key corruption
        for (let nk in externalNodes) {
            nodes.push(nk);
        }
        
        let edges = JSON.parse(JSON.stringify(o.edges));
        utils.mergeObjects(edges, c.edges);
        
        console.log('o', utils.showJSON(o));
        console.log('c', utils.showJSON(c));
        // console.log('edges', utils.showJSON(edges));
        
        while (Object.keys(edges).length > 0) {
            let cefnResult = this.createEdgesForNodes(nodes, edges, o, c, mainNodeData, connectedSubNodes);
            nodes = cefnResult.nodes;
            for (let i=0; i<cefnResult.edges.length; i++) {
                delete edges[cefnResult.edges[i]];
            }
            query += cefnResult.query;
        }
        
        // console.log('mainNodeData', mainNodeData);
        
        // set additional non-main node connection info to main node
        if (Object.keys(mainNodeData.subEdges).length > 0) {
            query += 'SET ';
            for (let nk in mainNodeData.subEdges) {
                const nk1 = nk.substring(0, 2);
                const nk2 = nk.substring(2);
                const edgeMapperFieldName = mainNodeData.key + '.' + nk1 + 'e' + nk2;
                let subEdgeKeys = [];
                
                for (let sek in mainNodeData.subEdges[nk]) {
                    subEdgeKeys.push(sek);
                    query += mainNodeData.key + '._ni_' + sek + '=' + mainNodeData.subEdges[nk][sek].nodeKey + '.id,';
                    query += mainNodeData.key + '._nn_' + sek + '="' + mainNodeData.subEdges[nk][sek].nodeName + '",';
                }
                
                query += edgeMapperFieldName + '=' + utils.formatField(subEdgeKeys) + ',';
            }
            query = query.substring(0, query.length - 1) + ' ';
        }
        
        query += 'RETURN ' + mainNodeData.key + ';';
        
        console.log('query', query);

        return query;
    },
    
    checkAvailableEdges: function(nodes) {
        logger.log('objectQuery.checkAvailableEdges', {type: 'function'});
// console.log('nodes', utils.showJSON(nodes));
        let query = '';
        
        for (let nk in nodes) {
            if (nodes[nk].label !== undefined) {
                query += 'MATCH (n' + nk + ':' + nodes[nk].label + ') ';
            } else {
                query += 'MATCH (n' + nk + ') ';
            }
            query += 'WHERE n' + nk + '.id="' + nodes[nk].nodeID + '" '
        }
        
        query += 'RETURN ';
        
        for (let nk in nodes) {
            const node = nodes[nk];
            for (let i=0; i<node.edges.length; i++) {
                let edge = node.edges[i];
                let nodePrefix = 'n' + nk + '.';
                
                if (edge.direction === 'out') {
                    query += nodePrefix + '_o_' + edge.type + ',';
                } else {
                    query += nodePrefix + '_i_' + edge.type + ',';
                }
                
                if (edge.subEdge !== undefined) {
                    query += nodePrefix + '_ni_' + edge.subEdge + ',';
                }
            }
        }
        
        query = query.substring(0, query.length - 1);
        
        // console.log('query', query);
        return query;
    },
    
    updateAvailableEdges: function(nodes) {
        logger.log('objectQuery.updateAvailableEdges', {type: 'function'});

        var query = '';
        console.log('nodes', utils.showJSON(nodes));
        for (var nk in nodes) {
            if (nodes[nk].label !== undefined) {
                query += 'MATCH (n' + nk + ':' + nodes[nk].label + ') ';
            } else {
                query += 'MATCH (n' + nk + ') ';
            }
            query += 'WHERE n' + nk + '.id="' + nodes[nk].nodeID + '" '
        }
        
        query += 'SET ';
        
        for (var nk in nodes) {
            var node = nodes[nk];
            for (var i=0; i<node.edges.length; i++) {
                var fieldName = 'n' + nk + '.' + node.edges[i];
                query += fieldName + '=' + fieldName + '-1,';
            }
        }
        
        query = query.substring(0, query.length - 1);
        
        query += ' RETURN true;';
        
        // console.log('query', query);
        return query;
    },
    
    findByEdge: function(destinationEdge) {
        logger.log('objectQuery.findByEdge', {type: 'function'});

        let fieldName = '_' + (destinationEdge.direction === 'in' ? 'i' : 'o') + '_' + destinationEdge.type;
        let query = 'MATCH (n) WHERE ';
        
        query += 'n.' + fieldName + '=-1 OR ' + 'n.' + fieldName + '>0 ';
        query += 'return n;';
        
        console.log('query', query);
        
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