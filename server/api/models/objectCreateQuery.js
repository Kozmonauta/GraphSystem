'use strict';

let objectCreateQuery = {

    className: 'objectCreateQuery',
    
    create: function(o, c, connectedSubNodes) {
        logger.log(this.className + '.create', {type: 'function'});
        // TODO handle node key corruption
        let query = '';

        let externalNodes = {};
        let eni = 0;
        let nodeAlias;
        let mainNodeData = {
            // edges which are connected to external nodes but not from the main node
            subEdges: {}
        };
        const subNodeAlias = 'esn_' + eni;
        
        // Collect & match external nodes
        for (let ek in o.edges) {
            let e = o.edges[ek];

            // if edge.target is an external node
            if (e.target !== undefined) {
                if (!this.isNodeAliased(e.target, externalNodes)) {
                    nodeAlias = 'en_' + (eni++);
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
                    nodeAlias = 'en_' + (eni++);
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
                    mainNodeData.alias = 'in_' + mainNodeData.key;
                }
            }

            if (e.subEdge !== undefined) {
                externalNodes[subNodeAlias] = connectedSubNodes[e.subEdge].id;
                query += 'MATCH (' + subNodeAlias + ') WHERE ' + subNodeAlias + '.id="' + connectedSubNodes[e.subEdge].id + '" ';
            }
        }
        
        // Nodes which are freshly aliased
        let nodes = {};
        for (let nk in externalNodes) {
            nodes[nk] = nk;
        }
        
        let edges = JSON.parse(JSON.stringify(o.edges));
        utils.mergeObjects(edges, c.edges);
        
        // console.log('o', utils.showJSON(o));
        // console.log('c', utils.showJSON(c));
        // console.log('edges', utils.showJSON(edges));
        
        // Create edges and endnodes for the already matched external nodes until all edges are created
        while (Object.keys(edges).length > 0) {
            let cefnResult = this.createEdgesForNodes(nodes, edges, o, c, mainNodeData, connectedSubNodes);
            nodes = cefnResult.nodes;
            for (let i=0; i<cefnResult.edges.length; i++) {
                delete edges[cefnResult.edges[i]];
            }
            query += cefnResult.query;
        }
        
        // console.log('mainNodeData', utils.showJSON(mainNodeData));
        // set additional non-main node connection info to main node
        if (Object.keys(mainNodeData.subEdges).length > 0) {
            query += 'SET ';
            for (let nk in mainNodeData.subEdges) {
                const nk1 = nk.substring(0, 1);
                const nk2 = nk.substring(2);
                // console.log('nk1', nk1);
                // console.log('nk2', nk2);
                const edgeMapperFieldName = mainNodeData.alias + '.' + nk1 + 'n' + nk2;
                // console.log('edgeMapperFieldName', edgeMapperFieldName);
                let subEdgeKeys = [];
                
                for (let sek in mainNodeData.subEdges[nk]) {
                    subEdgeKeys.push(sek);
                    query += mainNodeData.alias + '.ni_' + sek + '=' + mainNodeData.subEdges[nk][sek].nodeAlias + '.id,';
                    query += mainNodeData.alias + '.nn_' + sek + '="' + mainNodeData.subEdges[nk][sek].nodeName + '",';
                }
                
                query += edgeMapperFieldName + '=' + utils.formatField(subEdgeKeys) + ',';
            }
            query = query.substring(0, query.length - 1) + ' ';
        }
        
        query += 'RETURN ' + mainNodeData.alias + ';';
        
        console.log('query', query);

        return query;
    },
    
    createEdgesForNodes: function(nodes, edges, o, c, mainNodeData, connectedSubNodes) {
        logger.log(this.className + '.createEdgesForNodes', {type: 'function'});
        
        let query = '';
        let newNodes = {};
        let newEdges = [];
        // console.log('nodes', nodes);
        for (let nk in nodes) {
            const na = nodes[nk];
            
            for (let ek in edges) {
                let e = edges[ek];
                
                if (e.target === nk || e.source === nk) {
                    // new node key
                    let nnk;
                    // new node alias
                    let nna;
                    if (e.target === nk) {
                        nnk = e.source;
                    } else 
                    if (e.source === nk) {
                        nnk = e.target;
                    }
                    nna = 'in_' + nnk;

// TODO Insert id link for connected internal nodes to main node's fields. Hint: let main node creation for last and previously created node ids can be inserted.

                    // If the connected new node is referenced in the edges of the class
                    if (nnk !== undefined) {
                        
                        // If node was not created yet
                        if (newNodes[nnk] === undefined) {
                            let objectFieldsString = '';
                            
                            for (let fk in o.nodes[nnk].fields) {
                                // TODO not necessary, just for show the node names in neo4j browser
                                if (fk === 'name') {
                                    objectFieldsString += fk + ':' + utils.formatField(o.nodes[nnk].fields[fk]) + ',';
                                }
                                objectFieldsString += 'nf_' + fk + ':' + utils.formatField(o.nodes[nnk].fields[fk]) + ',';
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
                                            edgeMarkKey = 'ie_' + me.type;
                                            if (me.target !== nnk) {
                                                acNodeKey = me.target;
                                            }
                                        } else
                                        if (me.target === undefined) {
                                            edgeMarkKey = 'oe_' + me.type;
                                            if (me.source !== nnk) {
                                                acNodeKey = me.source;
                                            }
                                        }
                                        
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
                                            const acNodeAlias = 'in_' + acNodeKey;
                                            
                                            // console.log('add acNodeKey', edgeMarkKey, acNodeKey);
                                            if (mainNodeData.subEdges[edgeMarkKey] === undefined) {
                                                mainNodeData.subEdges[edgeMarkKey] = {};
                                            }
                                            
                                            mainNodeData.subEdges[edgeMarkKey][mek] = {
                                                nodeAlias: acNodeAlias,
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

                            query += 'CREATE (' + nna + ':' + c.nodes[nnk].label;
                            query += '{id:apoc.create.uuid(),' + objectFieldsString + '})';
                            
                            newNodes[nnk] = nna;
                        } else {
                            query += 'CREATE (' + nna + ')';
                        }
                        
                        if (e.target === nk) {
                            query += '-[:' + e.type + '{id:apoc.create.uuid()}]->(' + na + ') ';
                        } else 
                        if (e.source === nk) {
                            query += '<-[:' + e.type + '{id:apoc.create.uuid()}]-(' + na + ') ';
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
    
    checkAvailableEdges: function(nodes) {
        logger.log(this.className + '.checkAvailableEdges', {type: 'function'});
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
                    query += nodePrefix + 'oe_' + edge.type + ',';
                } else {
                    query += nodePrefix + 'ie_' + edge.type + ',';
                }
                
                if (edge.subEdge !== undefined) {
                    query += nodePrefix + 'ni_' + edge.subEdge + ',';
                }
            }
        }
        
        query = query.substring(0, query.length - 1);
        
        console.log('query', query);
        return query;
    },
    
    updateAvailableEdges: function(nodes) {
        logger.log(this.className + '.updateAvailableEdges', {type: 'function'});

        let query = '';
        for (let nk in nodes) {
            if (nodes[nk].label !== undefined) {
                query += 'MATCH (n' + nk + ':' + nodes[nk].label + ') ';
            } else {
                query += 'MATCH (n' + nk + ') ';
            }
            query += 'WHERE n' + nk + '.id="' + nodes[nk].nodeID + '" '
        }
        
        query += 'SET ';
        
        for (let nk in nodes) {
            const node = nodes[nk];
            for (let i=0; i<node.edges.length; i++) {
                const fieldName = 'n' + nk + '.' + node.edges[i];
                query += fieldName + '=' + fieldName + '-1,';
            }
        }
        
        query = query.substring(0, query.length - 1);
        
        query += ' RETURN true;';
        
        // console.log('query', query);
        return query;
    }
    
};

module.exports = objectCreateQuery;