'use strict';

var objectQuery = {

    add: function(objectData, classData) {
        logger.log('objectQuery.add', {type: 'function'});
        logger.log(objectData, {name: 'objectData'});
        logger.log(classData, {name: 'classData'});
        
        var query = '';
        var edgesDone= [];
        var nodesDone = [];
        
        for (var nk in objectData.nodes) {
            if (classData.nodes[nk].type === 'core') {
                objectData.nodes[nk]._classId = objectData.classId;
                objectData.nodes[nk]._ies = objectData._ies;
                objectData.nodes[nk]._oes = objectData._oes;
                delete objectData.classId;
            }
        }
        
        var withParams = [];
        for (var ek in classData.edges) {
            var sourceType = typeof classData.edges[ek].source;
            var targetType = typeof classData.edges[ek].target;
            
            // Between an external and an internal node
            if ((sourceType === 'object' || targetType === 'object') && sourceType !== targetType) {
                var edge = classData.edges[ek];
                var internalNodeKey;
                if (sourceType === 'object') {
                    internalNodeKey = edge.target;
                } else {
                    internalNodeKey = edge.source;
                }

                // TODO use filter instead of just id
                // TODO externalNodeId = objectData[internalNodeKey][ek] OR objectData[internalNodeKey][ek].name ?
                var externalNodeId = objectData.nodes[internalNodeKey][ek];
                var internalNodeLabel = classData.nodes[internalNodeKey].label;

                if (externalNodeId !== undefined) {
                    query += 'MATCH (en_' + ek + ') WHERE ID(en_' + ek + ') = ' + externalNodeId + ' ';
                    
                    if (!nodesDone.includes(internalNodeKey)) {
                        var nodeProperties = this.sortNodeProperties(classData.nodes[internalNodeKey], objectData.nodes[internalNodeKey]);
                        query += 'CREATE (in_' + internalNodeKey + ':' + internalNodeLabel + nodeProperties + ')';
                        nodesDone.push(internalNodeKey);
                    } else {
                        query += 'CREATE (in_' + internalNodeKey + ')';
                    }

                    if (sourceType === 'object') {
                        query += '<-[ed_' + ek + ':' + edge.label + ']-(en_' + ek + ') ';
                    } else {
                        query += '-[ed_' + ek + ':' + edge.label + ']->(en_' + ek + ') ';
                    }
                    
                    if (withParams.indexOf('en_' + ek) === -1) {
                        withParams.push('en_' + ek);
                    }
                    if (withParams.indexOf('in_' + internalNodeKey) === -1) {
                        withParams.push('in_' + internalNodeKey);
                    }
                    
                    if (withParams.length) {
                        query += 'WITH ';
                        for (var i=0;i<withParams.length;i++) {
                            query += withParams[i] + ',';
                        }
                        query = query.slice(0, -1) + ' ';
                    }
                }
                
                edgesDone.push(ek);
            }
        }
        
        // withParams = '';
        for (var ek in classData.edges) {
            var sourceType = typeof classData.edges[ek].source;
            var targetType = typeof classData.edges[ek].target;
            
            // Between 2 internal nodes
            if (sourceType === 'string' && targetType === 'string') {
                var edge = classData.edges[ek];
                
                if (!nodesDone.includes(edge.source)) {
                    var nodeLabel = classData.nodes[edge.source].label;
                    query += 'CREATE (in_' + edge.source + ':' + nodeLabel + this.sortNodeProperties(classData.nodes[edge.source], objectData.nodes[edge.source]) + ')';
                    nodesDone.push(edge.source);
                    
                    if (withParams.indexOf('in_' + edge.source) === -1) {
                        withParams.push('in_' + edge.source);
                    }
                } else {
                    query += 'CREATE (in_' + edge.source + ')';
                }
                
                query += '-[ed_' + ek + ':' + edge.label + ']->';
                
                if (!nodesDone.includes(edge.target)) {
                    var nodeLabel = classData.nodes[edge.target].label;
                    query += '(in_' + edge.target + ':' + nodeLabel + this.sortNodeProperties(classData.nodes[edge.target], objectData.nodes[edge.target]) + ') ';
                    nodesDone.push(edge.target);
                    
                    if (withParams.indexOf('in_' + edge.target) === -1) {
                        withParams.push('in_' + edge.target);
                    }
                    
                } else {
                    query += '(in_' + edge.target + ') ';
                }
                
                if (withParams.length) {
                    query += 'WITH ';
                    for (var i=0;i<withParams.length;i++) {
                        query += withParams[i] + ',';
                    }
                    query = query.slice(0, -1) + ' ';
                }
                
                edgesDone.push(ek);
            }
        }
        
        if (nodesDone.length === 0) {
            for (nk in objectData.nodes) {
                var nodeClass = classData.nodes[nk];
                var node = objectData.nodes[nk];
                if (nodeClass.type === 'core') {
                    var nodeLabel = nodeClass.label;
                    var nodeProperties = this.sortNodeProperties(nodeClass, node);
                    query += 'CREATE (in_' + nk + ':' + nodeLabel + nodeProperties + ')';
                    nodesDone.push(nk);
                }
            }
            
        }
        
        query += ' RETURN true';
        
        logger.log(query, {name: 'query'});

        return query;
    },
    
    update: function(oldObjectData, objectData, classData) {
        logger.log('objectQuery.update', {type: 'function'});
        // Warning! oldObjectData and objectData have different structure
        logger.log(oldObjectData, {name: 'oldObjectData'});
        logger.log(objectData, {name: 'objectData'});
        logger.log(classData, {name: 'classData'});
        
        var classFilter = {};
        var core = undefined;
        for (var nk in objectData.nodes) {
            if (classData.nodes[nk].type === 'core') {
                core = nk;
                objectData.nodes[nk]._classId = objectData.classId;
                classFilter.id = objectData.classId;
                classFilter.label = classData.nodes[nk].label;
                delete objectData.classId;
            }
        }
        
        var extraNodes = {};
        for (var nk in objectData.nodes) {
            var node = objectData.nodes[nk];
            if (node.id !== undefined) {
                for (var pk in node) {
                    if (classData.edges[pk] !== undefined) {
                        var oldValue = oldObjectData.edges[pk].endPoint.id;
                        if (oldValue !== node[pk]) {
                            extraNodes[pk] = node[pk];
                        }
                    }
                }
            }
        }
        
        var coreId = objectData.nodes[core].id;
        var queryParams = {
            'class': classData,
            id: coreId,
            type: 'no-return',
            extraNodes: extraNodes
        };

        var query = this.get(queryParams);

        // Add "CREATE" statements
        for (var nk in objectData.nodes) {
            var node = objectData.nodes[nk];
            if (node.id !== undefined) {
                for (var pk in node) {
                    // When object property is reference to a connection
                    if (classData.edges[pk] !== undefined) {
                        var edgeClass = classData.edges[pk];
                        var sourceType = typeof edgeClass.source;
                        var targetType = typeof edgeClass.target;
            
                        // Between internal and external nodes
                        if ((sourceType === 'object' || targetType === 'object') && sourceType !== targetType) {
                            if (oldObjectData.edges[pk] !== undefined) {
                                var oldValue = oldObjectData.edges[pk].endPoint.id;
                                if (oldValue !== node[pk]) {
                                    var internalNodeKey;
                                    if (sourceType === 'object') {
                                        internalNodeKey = edgeClass.target;
                                    } else {
                                        internalNodeKey = edgeClass.source;
                                    }

                                    // var externalNodeId = objectData.nodes[internalNodeKey][pk];
                                    var internalNodeLabel = classData.nodes[internalNodeKey].label;
                                    
                                    // query += 'MATCH (n_' + pk + '_epn) WHERE ID(n_' + pk + '_epn) = ' + externalNodeId + ' ';
                                    query += 'DELETE e_' + pk + ' ';
                                    query += 'CREATE (n_' + internalNodeKey + ')';
                                    
                                    if (sourceType === 'object') {
                                        query += '<-[e_' + pk + '_n:' + edgeClass.label + ']-(n_' + pk + '_epn) ';
                                    } else {
                                        query += '-[e_' + pk + '_n:' + edgeClass.label + ']->(n_' + pk + '_epn) ';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        query += 'SET ';
        // Add "SET" statements
        for (var nk in objectData.nodes) {
            var node = objectData.nodes[nk];
            if (node.id !== undefined) {
                for (var pk in node) {
                    // When object property is a node property
                    if (classData.nodes[nk].properties[pk] !== undefined) {
                        if (pk !== 'id' && pk !== '_classId' && node[pk]) {
                            query += 'n_' + nk + '.' + pk + '=' + this.alignNodeProperty(node[pk]) + ',';
                        }
                    }
                }
            }
        }
        
        query = query.slice(0, -1);
        
        query += ' RETURN true';

        logger.log(query, {name: 'query'});

        return query;
    },
    
    get: function(params) {
        logger.log('objectQuery.get', {type: 'function'});
        logger.log(params, {name: 'params'});
        
        // Info: Graph where optional edge is followed by required one is not supported
        
        var query;
        var classData = params['class'];
        var objectId = params.id;
        var parents = params.parents;

        // Node is done when all of its egdes are done
        var nodesDone = [];
        // Edge is done when both endpoints are done
        var edgesDone = [];
        var nodesAliased = [];
        var queryParts = [];
        var coreKey;
        
        for (nk in classData.nodes) {
            if (classData.nodes[nk].type === 'core') {
                coreKey = nk;
                break;
            }
        }
        
        if (parents !== undefined) {
            for (var i=0;i<parents.length;i++) {
                if (i === 0) {
                    query = 'MATCH (p_' + parents[i].id + ':' + parents[i].label + ') ';
                    query += 'WHERE ID(p_' + parents[i].id + ') = ' + parents[i].id + ' ';
                } else 
                if (i < parents.length) {
                    query = 'MATCH (p_' + parents[i - 1].id + ')-[:HAS]->(p_' + parents[i].id + ') ';
                    query += 'WHERE ID(p_' + parents[i].id + ') = ' + parents[i].id + ' ';
                } else {
                    query = 'MATCH (p_' + parents[i - 1].id + ')-[:HAS]->(p_' + parents[i].id + ') ';
                    query += 'WHERE ID(p_' + parents[i].id + ') = ' + parents[i].id + ' ';
                }
                queryParts.push({query: query, type: 'MATCH'});
            }
            
            query = 'MATCH (p_' + parents[i].id + ')-[:HAS]->(n_' + coreKey + ':' + classData.nodes[coreKey].label + ') ';
            query += 'WHERE ID(n_' + coreKey + ') = ' + objectId + ' ';
            queryParts.push({query: query, type: 'MATCH'});
            
            for (var ek in classData.edges) {
                if (classData.edges[ek].target === coreKey && classData.edges[ek].label === 'HAS') {
                    edgesDone.push(ek);
                    break;
                }
            }
        } else {
            query = 'MATCH (n_' + coreKey + ':' + classData.nodes[coreKey].label + ') ';
            query += 'WHERE ID(n_' + coreKey + ') = ' + objectId + ' ';
            queryParts.push({query: query, type: 'MATCH'});
        }
        
        nodesAliased.push(coreKey);
        
        // query += this.getNodeEdges(coreKey, {
        this.getNodeEdges(coreKey, {
            'class': classData, 
            queryParts: queryParts,
            nodesDone: nodesDone,
            edgesDone: edgesDone,
            nodesAliased: nodesAliased,
            extraNodes: params.extraNodes
        });
        
        if (params.type === 'no-return') {
            return query;
        }
        
        query += 'RETURN ';

        for (var nk in classData.nodes) {
            if (!nodesDone.includes(nk)) {
                delete classData.nodes[nk];
            }
        }

        for (var nk in classData.nodes) {
            var node = classData.nodes[nk];
            query += 'ID(n_' + nk + '),';
            for (var pk in node.properties) {
                var property = node.properties[pk];
                query += 'n_' + nk + '.' + pk + ',';
            }
        }
        
        for (var ek in classData.edges) {
            var edge = classData.edges[ek];
            
            if (edge.multiple === true) continue;
            
            var sourceType = typeof edge.source;
            var targetType = typeof edge.target;
            if (sourceType === 'string' && targetType === 'string') {
                query += 'ID(e_' + ek + '),';
            } else 
            if (sourceType === 'string' && targetType === 'object') {
                query += 'ID(e_' + ek + '),';
                query += 'ID(n_' + ek + '_ep),';
                query += 'n_' + ek + '_ep.name,';
            } else 
            if (sourceType === 'object' && targetType === 'string') {
                query += 'ID(e_' + ek + '),';
                query += 'ID(n_' + ek + '_ep),';
                query += 'n_' + ek + '_ep.name,';
            }
        }
        
        query = query.slice(0, -1);

        logger.log(query, {name: 'query'});
        
        return query;
    },
    
    find: function(params) {
        logger.log('objectQuery.find', {type: 'function'});
        logger.log(params, {name: 'params'});
        
        var query = '';
        var classData = params['class'];
        
        var edgesDone = [];
        var nodesDone = [];
        var nodesAliased = [];
        
        var coreKey;
        for (nk in classData.nodes) {
            if (classData.nodes[nk].type === 'core') {
                coreKey = nk;
                break;
            }
        }
        
        var filterObject = params.filterObject;
        logger.log(filterObject, {name: 'filterObject'});
        
        query += 'MATCH (n_' + coreKey + ':' + classData.nodes[coreKey].label + ') ';
        query += 'WHERE n_' + coreKey + '._classId=' + filterObject.classId + ' ';
        
        nodesAliased.push(coreKey);
        
        if (filterObject.conditions !== undefined) {
            query += 'AND '
            query += this.getConditionsForNode(coreKey, {
                conditions: params.filterObject.conditions,
                'class': classData, 
                edgesDone: edgesDone
            });
        }
        
        query += this.getNodeEdges(coreKey, {
            'class': classData, 
            nodesDone: nodesDone,
            edgesDone: edgesDone,
            nodesAliased: nodesAliased,
            extraNodes: params.extraNodes,
            conditions: filterObject.conditions
        });
        
        query += 'RETURN ';

        for (var nk in classData.nodes) {
            if (!nodesDone.includes(nk)) {
                delete classData.nodes[nk];
            }
        }

        for (var nk in classData.nodes) {
            var node = classData.nodes[nk];
            query += 'ID(n_' + nk + '),';
            for (var pk in node.properties) {
                var property = node.properties[pk];
                if (property.list === true) {
                    query += 'n_' + nk + '.' + pk + ',';
                }
            }
        }
        
        for (var ek in classData.edges) {
            var edge = classData.edges[ek];
            
            if (edge.multiple === true) continue;

            if (edge.list === true) {
                var sourceType = typeof edge.source;
                var targetType = typeof edge.target;
                if (sourceType === 'string' && targetType === 'string') {
                    query += 'ID(e_' + ek + '),';
                } else 
                if (sourceType === 'string' && targetType === 'object') {
                    query += 'ID(e_' + ek + '),';
                    query += 'ID(n_' + ek + '_ep),';
                    query += 'n_' + ek + '_ep.name,';
                } else 
                if (sourceType === 'object' && targetType === 'string') {
                    query += 'ID(e_' + ek + '),';
                    query += 'ID(n_' + ek + '_ep),';
                    query += 'n_' + ek + '_ep.name,';
                }
            }
        }
        
        // Remove ,
        query = query.slice(0, -1);
        
        logger.log(query, {name: 'query'});

        return query;
    },
    
    findForEdge: function(params) {
        logger.log('objectQuery.findForEdge', {type: 'function'});
        logger.log(params, {name: 'params'});
        
        var query = '';
        var edgesDone = [];
        var nodesDone = [];
        
        if (params.nl !== undefined) {
            if (params.ed === 'in') {
                query += 'MATCH (n:' + nl + ') WHERE "' + params.el + '" IN n._oes ';
            } else 
            if (params.ed === 'out') {
                query += 'MATCH (n:' + nl + ') WHERE "' + params.el + '" IN n._ies ';
            }
        } else 
        if (params.nc !== undefined) {
            if (params.ed === 'in') {
                query += 'MATCH (n) WHERE n.classId=' + params.nc + ' AND "' + params.el + '" IN n._oes ';
            } else 
            if (params.ed === 'out') {
                query += 'MATCH (n) WHERE n.classId=' + params.nc + ' AND "' + params.el + '" IN n._ies ';
            }
        } else {
            if (params.ed === 'in') {
                query += 'MATCH (n) WHERE "' + params.el + '" IN n._oes ';
            } else 
            if (params.ed === 'out') {
                query += 'MATCH (n) WHERE "' + params.el + '" IN n._ies ';
            }
        }
            
        query += 'RETURN ';
        query += 'ID(n) AS id,';
        query += 'n.name AS name';
            
        logger.log(query, {name: 'query'});

        return query;
    },
    
    findByClasses: function(classes) {
        logger.log('objectQuery.findByClasses', {type: 'function'});
        logger.log(classes, {name: 'classes'});
        
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
    
    // getEdge: function(nodeKey, edgeKey, optional, params) {
    getNodeEdges: function(nodeKey, edgeKey, optional, params) {
        // logger.log('objectQuery.getEdge', {type: 'function'});
        // logger.log(nodeKey, {name: 'nodeKey'});
        // logger.log(edgeKey, {name: 'edgeKey'});
        // logger.log(optional, {name: 'optional'});
        // logger.log(params, {name: 'params'});
        
        var query = '';
        var queryPart = {};
        var classData = params['class'];
        var edge = classData.edges[edgeKey];
        var sourceType = typeof edge.source;
        var targetType = typeof edge.target;
        var sourceAliased;
        var targetAliased;

        for (var ek in classData.edges) {
            // Internal edge: (nodeKey)->
            if (targetType === 'string' && edge.source === nodeKey) {
                var nodeAliased = params.nodesAliased.includes(nodeKey);

                if (optional === true) {
                    query += 'OPTIONAL ';
                    queryPart.type = 'OPTIONAL';
                } else {
                    queryPart.type = 'MATCH';
                }
                
                // already aliased
                if (nodeAliased) {
                    query += 'MATCH (n_' + nodeKey + ')';
                } 
                // not aliased yet
                else {
                    var nodeLabel = classData.nodes[nodeKey].label;
                    query += 'MATCH (n_' + nodeKey + ':' + nodeLabel + ')';
                    params.nodesAliased.push(nodeKey);
                }

                query += '-[e_' + edgeKey + ':' + edge.label + ']->(n_' + edge.target + ') ';
                
                params.edgesDone.push(edgeKey);
                queryPart.query = query;
                params.queryParts.push(queryPart);
                
                // Recursively find connected nodes
                query += this.getNodeEdges(edge.target, params);
            } else 
                
            // Internal edge: ->(nodeKey)
            if (sourceType === 'string' && edge.target === nodeKey) {
                nodeAliased = params.nodesAliased.includes(nodeKey);

                if (optional === true) {
                    query += 'OPTIONAL ';
                    queryPart.type = 'OPTIONAL';
                } else {
                    queryPart.type = 'MATCH';
                }
                
                // already aliased
                if (nodeAliased) {
                    query += 'MATCH (n_' + nodeKey + ')';
                } 
                // not aliased yet
                else {
                    var nodeLabel = classData.nodes[nodeKey].label;
                    query += 'MATCH (n_' + nodeKey + ':' + nodeLabel + ')';
                    params.nodesAliased.push(nodeKey);
                }

                query += '<-[e_' + edgeKey + ':' + edge.label + ']-(n_' + edge.source + ') ';

                params.edgesDone.push(edgeKey);
                params.queryParts.push(queryPart);
                // Recursively find connected nodes
                query += this.getNodeEdges(edge.source, params);
            } else 
            
            // External edge: (nodeKey)->
            if (targetType === 'object' && edge.source === nodeKey) {
                var targetAliased = params.nodesAliased.includes(nodeKey);

                if (optional === true) {
                    query += 'OPTIONAL ';
                    queryPart.type = 'OPTIONAL';
                } else {
                    queryPart.type = 'MATCH';
                }
                
                // already aliased
                if (targetAliased) {
                    query += 'MATCH (n_' + nodeKey + ')';
                } 
                // not aliased yet
                else {
                    var nodeLabel = classData.nodes[nodeKey].label;
                    query += 'MATCH (n_' + nodeKey + ':' + nodeLabel + ')';
                    params.nodesAliased.push(nodeKey);
                }

                // Get just the node, without neighbors
                query += '-[e_' + edgeKey + ':' + edge.label + ']->(n_' + edgeKey + '_ep) ';
                params.edgesDone.push(edgeKey);
            } else 

            // External edge: ->(nodeKey)
            if (sourceType === 'object' && edge.target === nodeKey) {
                var sourceAliased = params.nodesAliased.includes(nodeKey);

                if (optional === true) {
                    query += 'OPTIONAL ';
                    queryPart.type = 'OPTIONAL';
                } else {
                    queryPart.type = 'MATCH';
                }
                
                // already aliased
                if (sourceAliased) {
                    query += 'MATCH (n_' + nodeKey + ')';
                } 
                // not aliased yet
                else {
                    var nodeLabel = classData.nodes[nodeKey].label;
                    query += 'MATCH (n_' + nodeKey + ':' + nodeLabel + ')';
                    params.nodesAliased.push(nodeKey);
                }

                // Get just the node, without neighbors
                query += '<-[e_' + edgeKey + ':' + edge.label + ']-(n_' + edgeKey + '_ep) ';

                params.edgesDone.push(edgeKey);
            }
        }        
        
        if (sourceAliased === false && targetAliased === false) {
            console.log('Error! Should not happen!');
        }
        
        return query;
    },

    // Get connected edges with nodes
    getNodeEdges: function(nodeKey, params) {
        // logger.log('objectQuery.getNodeEdges', {type: 'function'});
        logger.log(nodeKey, {name: '--- nodeKey'});
        logger.log(params.conditions, {name: 'params.conditions'});

        var query;
        var queryPart;
        var classData = params['class'];
        var newEdges = [];

        if (params.nodesDone.includes(nodeKey)) return;

        // First, add MATCH-es based on class
        for (var ek in classData.edges) {
            var edge = classData.edges[ek];
        logger.log(ek, {name: 'ek'});

            // for (var 
            if (!params.edgesDone.includes(ek) && edge.multiple !== true) {
                if (edge.required === true) {
                    // Multiple should not be allowed to be required
                    queryPart = this.getEdge(nodeKey, ek, false, params);
                    params.queryParts.push(queryPart);
                    newEdges.push(ek);
                } else {
                    queryPart = this.getEdge(nodeKey, ek, true, params);
                    params.queryParts.push(queryPart);
                    newEdges.push(ek);
                }
            }
        }

        if (!params.nodesAliased.includes(nodeKey) && params.conditions !== undefined && params.conditions.length > 0) {
            query += 'WHERE ';
            query += this.getConditionsForNode(nodeKey, params);
        }
        
        // For update
        if (params.extraNodes !== undefined) {
            for (var nk in params.extraNodes) {
                query = 'MATCH (n_' + nk + '_epn) ';
                query += 'WHERE ID(n_' + nk + '_epn) = ' + params.extraNodes[nk] + ' ';
                params.queryParts.push({query: query, type: 'MATCH'});
                delete params.extraNodes[nk];
            }
        }
        
        // if (!params.edgesDone.includes(edgeKey) && params.conditions !== undefined && params.conditions.length > 0) {
            // query += 'WHERE ';
            // query += this.getConditionsForExternalNode(edgeKey, params);
        // }
        
        params.nodesDone.push(nodeKey);
        
        return query;
    },
    
    getConditionsForNode: function(nodeKey, params) {
        var nodeConditionNumber = 0;
        var query = '';
        var conditions = params.conditions;
        var classData = params['class'];
        
        // console.log('GCFN nodeKey', nodeKey);
        for (var i=0;i<conditions.length;i++) {
            var c = conditions[i];
        
            // Now always one element
            for (var ck in c) {
                // TODO handle if property is not the first element
                // Property format: [nodeKey].[property]
                var propertyParts = c[ck][0].split('.');
                if (nodeKey !== propertyParts[0]) continue;
                
                var value = c[ck][1];
                var propertyKey = propertyParts[1];
                var classProperty;
                
                // In case of node property
                if (classData.nodes[nodeKey] !== undefined && classData.nodes[nodeKey].properties[propertyKey] !== undefined) {
                    var propertyType = classData.nodes[nodeKey].properties[propertyKey].type;
                    
                    // range type
                    if (ck === 'rg' && typeof value === 'object') {
                        query += 'n_' + c[ck][0] + '>=';
                        
                        // if (typeof value.from === 'string') {
                        if (propertyType === 'text') {
                            query += '"' + value.from + '" ';
                        } else {
                            query += '' + value.from + ' ';
                        }
                        
                        query += 'AND ';
                        query += 'n_' + c[ck][0] + '<=';
                        
                        // if (typeof value.from === 'string') {
                        if (propertyType === 'text') {
                            query += '"' + value.to + '" ';
                        } else {
                            query += '' + value.to + ' ';
                        }
                    } else {
                        if (propertyType === 'text') {
                            query += 'toLower(n_' + c[ck][0] + ') ';
                        } else {
                            query += 'n_' + c[ck][0] + ' ';
                        }
                        
                        if (ck === 'e') { query += '='; } else 
                        if (ck === 'g') { query += '>'; } else 
                        if (ck === 'ge') { query += '>='; } else 
                        if (ck === 'l') { query += '<'; } else 
                        if (ck === 'le') { query += '<='; };
                        
                        // if (typeof value === 'string') {
                        if (propertyType === 'text') {
                            if (ck === 'c') { query += 'CONTAINS '; }
                            query += '"' + value.toLowerCase() + '" ';
                        } else 
                        if (typeof value === 'object') {
                            if (ck === 'c') { query += 'IN '; }
                            query += '[';
                            
                            for (var j=0;j<value.length;j++) {
                                if (typeof value[j] === 'string') {
                                    query += '"' + value[j].toLowerCase() + '"';
                                } else {
                                    query += '' + value[j] + '';
                                }
                                query += ',';
                            }
                            
                            query = query.slice(0, -1);
                            query += ']';
                        } else {
                            query += '' + value + ' ';
                        }
                    }
                    
                    nodeConditionNumber++;
                    query += 'AND ';
                }
            }
        }
        
        if (nodeConditionNumber > 0) {
            query = query.slice(0, -4);
        } else {
            query += 'TRUE ';
        }
        
        return query;
    },
    
    getConditionsForExternalNode: function(nodeKey, params) {
        var query = '';
        var conditions = params.conditions;
        
        for (var i=0;i<conditions.length;i++) {
            var c = conditions[i];
        
            // Now always one element
            for (var ck in c) {
                // TODO handle if property is not the first element
                // Property format: [nodeKey].[property]
                var propertyParts = c[ck][0].split('.');
                var propertyKey = propertyParts[1];
                
                if (propertyKey !== nodeKey) continue;
                
                var value = c[ck][1];
                
                query += 'ID(n_' + propertyKey + '_ep)=' + value + ' ';
            }
        }
        
        return query;
    },
    
    sortNodeProperties: function(classData, objectProperties) {
        var s = '{';
        for (var k in objectProperties) {
            if (objectProperties[k] !== undefined && objectProperties[k] !== '') {
                s += '' + k + ':';
                s += this.alignNodeProperty(objectProperties[k]);
                s += ',';
            }
        }
        if (s.length > 1) {
            s = s.slice(0, -1);
        }
        s += '}';
        return s;
    },
    
    // Adds brackets, quotes to query variable string based on its type
    alignNodeProperty: function(p) {
        var s = '';
        if (Array.isArray(p)) {
            s += '[';
            for (var i=0;i<p.length;i++) {
                s += '"' + p[i] + '"';
                if (i < p.length - 1) {
                    s += ',';
                }
            }
            s += ']';
        } else 
        if (!isNaN(p)){
            s += '' + p + '';
        } else {
            if (p.indexOf('"') !== -1) {
                s += "'" + p + "'";
            } else {
                s += '"' + p + '"';
            }
        }
        return s;
    },
    
    delete: function(params) {
        logger.log('objectQuery.delete', {type: 'function'});
        
        var classData = params['class'];
        var objectId = params.id;
        
        var queryParams = {
            'class': classData,
            id: objectId,
            type: 'no-return'
        };

        var query = this.get(queryParams);
console.log('query', query);
return false;

        // Add "CREATE" statements
        for (var nk in objectData.nodes) {
            var node = objectData.nodes[nk];
            if (node.id !== undefined) {
                for (var pk in node) {
                    // When object property is reference to a connection
                    if (classData.edges[pk] !== undefined) {
                        var edgeClass = classData.edges[pk];
                        var sourceType = typeof edgeClass.source;
                        var targetType = typeof edgeClass.target;
            
                        // Between internal and external nodes
                        if ((sourceType === 'object' || targetType === 'object') && sourceType !== targetType) {
                            if (oldObjectData.edges[pk] !== undefined) {
                                var oldValue = oldObjectData.edges[pk].endPoint.id;
                                if (oldValue !== node[pk]) {
                                    var internalNodeKey;
                                    if (sourceType === 'object') {
                                        internalNodeKey = edgeClass.target;
                                    } else {
                                        internalNodeKey = edgeClass.source;
                                    }

                                    // var externalNodeId = objectData.nodes[internalNodeKey][pk];
                                    var internalNodeLabel = classData.nodes[internalNodeKey].label;
                                    
                                    // query += 'MATCH (n_' + pk + '_epn) WHERE ID(n_' + pk + '_epn) = ' + externalNodeId + ' ';
                                    query += 'DELETE e_' + pk + ' ';
                                    query += 'CREATE (n_' + internalNodeKey + ')';
                                    
                                    if (sourceType === 'object') {
                                        query += '<-[e_' + pk + '_n:' + edgeClass.label + ']-(n_' + pk + '_epn) ';
                                    } else {
                                        query += '-[e_' + pk + '_n:' + edgeClass.label + ']->(n_' + pk + '_epn) ';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        query += 'SET ';
        // Add "SET" statements
        for (var nk in objectData.nodes) {
            var node = objectData.nodes[nk];
            if (node.id !== undefined) {
                for (var pk in node) {
                    // When object property is a node property
                    if (classData.nodes[nk].properties[pk] !== undefined) {
                        if (pk !== 'id' && pk !== '_classId' && node[pk]) {
                            query += 'n_' + nk + '.' + pk + '=' + this.alignNodeProperty(node[pk]) + ',';
                        }
                    }
                }
            }
        }
        
        query = query.slice(0, -1);
        
        query += ' RETURN true';

        logger.log(query, {name: 'query'});

        return query;
    }
    
};

module.exports = objectQuery;