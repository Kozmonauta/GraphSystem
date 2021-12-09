'use strict';

let objectUpdateQuery = {

    className: 'objectUpdateQuery',
    
    update: function(updateParams, oNew, oOld, c, connectedSubNodes) {
        logger.log(this.className + '.update', {type: 'function'});
        
        let query = 'MATCH (c:Core) RETURN c;';

        console.log('query', query);

        return query;
    },
    
    createEdgesForNodes: function(nodes, edges, o, c, mainNodeData, connectedSubNodes) {
        logger.log(this.className + '.createEdgesForNodes', {type: 'function'});
        
        let query = '';
        let newNodes = {};
        let newEdges = [];
        console.log('nodes', nodes);
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
                            query += '-[:' + e.type + ']->(' + na + ') ';
                        } else 
                        if (e.source === nk) {
                            query += '<-[:' + e.type + ']-(' + na + ') ';
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
    }
    
};

module.exports = objectUpdateQuery;