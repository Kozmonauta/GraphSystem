'use strict';

let objectCreateQuery = {

    className: 'objectCreateQuery',
    
    create: function(o, c, connectedSubNodes) {
        logger.log(this.className + '.create', {type: 'function'});
        // TODO handle node key corruption
        let query = '';

        // subEdges: edges which are connected to external nodes but not from the main node
        let mainNodeData = { subEdges: {} };
        
        // Keys of the nodes which still have to be matched
        let nodes = {};
        for (let nk in o.nodes) {
            // status: 0 = node not touched; 1 = node aliased; 2 = node + all connected edges aliased
            nodes[nk] = {
                status: 0
            };
        }
        
        query += this.matchExternalNodes(o, c, mainNodeData, nodes, connectedSubNodes);
        console.log('nodes (after matchExternalNodes): ', nodes);
        // clone o.edges -> the edges which still have to be matched
        let edgesToDo = JSON.parse(JSON.stringify(o.edges));
        utils.mergeObjects(edgesToDo, c.edges);
        
        // console.log('o', utils.showJSON(o));
        // console.log('c', utils.showJSON(c));
        // console.log('edges', utils.showJSON(edges));
        
        // Create edges and endnodes for the already matched external nodes until all edges are created
        while (Object.keys(edgesToDo).length > 0) {
            let nodeKey = this.getNodeByStatus(nodes, 1);
            if (nodeKey === undefined) {
                console.log('Error: no node found with aliased status');
                return;
            }
            query += this.createEdgesForNode(nodeKey, edgesToDo, nodes, o, c, mainNodeData, connectedSubNodes);
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
    
    // Create all edges with their other endnodes
    createEdgesForNode: function(nodeKey, edgesToDo, nodes, o, c, mainNodeData, connectedSubNodes) {
        logger.log(this.className + '.createEdgesForNode', {type: 'function'});
        
        let query = '';
        let newEdges = [];
console.log('nodeKey: ', nodeKey);
console.log('nodes: ', nodes);
        
        for (let ek in edgesToDo) {
            let e = edgesToDo[ek];
            
            // If edge is connectd to the node
            if (e.target === nodeKey || e.source === nodeKey) {
                
console.log('ek: ', ek);
console.log('e: ', e);
                // new node key
                let endNodeKey;
                // new node alias
                let endNodeAlias;
                if (e.target === nodeKey) {
                    endNodeKey = e.source;
                } else 
                if (e.source === nodeKey) {
                    endNodeKey = e.target;
                }
                endNodeAlias = 'in_' + endNodeKey;

console.log('connected new node: ', endNodeKey);
// TODO Insert id link for connected internal nodes to main node's fields. Hint: let main node creation for last and previously created node ids can be inserted.
                    
                if (endNodeKey !== undefined) {
                    // If node was not created yet. It can be already created when there are multiple edges between two nodes
                    if (nodes[endNodeKey].status === 0) {
                        let objectFieldsString = '';
                        nodes[endNodeKey].status = 1;
                        
                        for (let fk in o.nodes[endNodeKey].fields) {
                            // TODO not necessary, just for show the node names in neo4j browser
                            if (fk === 'name') {
                                objectFieldsString += fk + ':' + utils.formatField(o.nodes[endNodeKey].fields[fk]) + ',';
                            }
                            objectFieldsString += 'nf_' + fk + ':' + utils.formatField(o.nodes[endNodeKey].fields[fk]) + ',';
                        }

                        if (endNodeKey === mainNodeData.key) {
                            objectFieldsString += this.createMainNodeData(endNodeKey, o, c, mainNodeData);
                        }                       
                        
                        objectFieldsString = objectFieldsString.substring(0, objectFieldsString.length - 1);

                        query += 'CREATE (' + endNodeAlias + ':' + c.nodes[endNodeKey].label;
                        query += '{id:apoc.create.uuid(),' + objectFieldsString + '})';
                        
                        nodes[endNodeKey].alias = endNodeAlias;
                    } else {
                        query += 'CREATE (' + endNodeAlias + ')';
                    }
                    
                    if (e.target === nodeKey) {
                        query += '-[:' + e.type + '{id:apoc.create.uuid()}]->(' + nodes[nodeKey].alias + ') ';
                    } else 
                    if (e.source === nodeKey) {
                        query += '<-[:' + e.type + '{id:apoc.create.uuid()}]-(' + nodes[nodeKey].alias + ') ';
                    }
                }
                
                newEdges.push(ek);
            }
        }
        
        for (let i=0; i<newEdges.length; i++) {
            delete edgesToDo[newEdges[i]];
        }
        
        nodes[nodeKey].status = 2;
        
        return query;
        // return {
            // query: query,
            // nodes: newNodes,
            // edges: newEdges
        // }
    },
    
    // Returns query part which matches external nodes
    // Modifies:
    //     o: edge source / target gets filled with external node alias
    //     mainNodeData: key and alias gets filled
    matchExternalNodes: function(o, c, mainNodeData, nodes, connectedSubNodes) {
        let query = '';
        let eni = 0; // external node index
        let ensi = 0; // external node sub edge index

        // Collect & match external nodes (TODO is it a good assumption? if 1 endnode of an object is defined -> external edge)
        for (let ek in o.edges) {
            let e = o.edges[ek];
            let nodeAlias;
            let subNodeAlias = 'ens_' + ensi;

            // if edge.target is an external node (edge.target = id of external node)
            if (e.target !== undefined) {
                if (!this.isNodeAliased(e.target, nodes)) {
                    nodeAlias = 'en_' + (eni++);
                    nodes[nodeAlias] = {
                        status: 1,
                        alias: nodeAlias,
                        id: e.target                    
                    };
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
                if (!this.isNodeAliased(e.source, nodes)) {
                    nodeAlias = 'en_' + (eni++);
                    nodes[nodeAlias] = {
                        status: 1,
                        alias: nodeAlias,
                        id: e.source                    
                    };
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
                nodes[subNodeAlias] = {
                    status: 1,
                    alias: subNodeAlias,
                    id: connectedSubNodes[e.subEdge].id
                };
                query += 'MATCH (' + subNodeAlias + ') WHERE ' + subNodeAlias + '.id="' + connectedSubNodes[e.subEdge].id + '" ';
                ensi++;
            }
        }

        return query;
    },
    
    // Store class date in object's main node
    createMainNodeData: function(nnk, o, c, mainNodeData) {
        // store class reference in main node
        let q = 'class:"' + c.id + '",';

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
            q += ek + ':' + edgeMarks[ek] + ',';
        }
        
        return q;
    },
    
    isNodeAliased: function(id, nodes) {
        for (let nk in nodes) {
            if (id === nodes[nk].id) return true;
        }
        return false;
    },
    
    getNodeByStatus: function(nodes, status) {
        for (let nk in nodes) {
            if (status === nodes[nk].status) return nk;
        }
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