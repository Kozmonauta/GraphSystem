'use strict';

var objectUtils = {

    // Collect the nodes (main nodes of objects) and their required available edge fields so they can be connected to the actual object
    getNodesToCheck: function(objectData, classData) {
        let nodesToCheck = {};
        let i = 0;
        
        for (let ek in objectData.edges) {
            // if internal edge
            if (classData.edges[ek].source !== undefined && classData.edges[ek].target !== undefined) continue;
            
            i++;
            let direction;
            let nodeToCheckID;

            if (classData.edges[ek].target !== undefined) {
                direction = 'in';
                nodeToCheckID = objectData.edges[ek].source;
            } else {
                direction = 'out';
                nodeToCheckID = objectData.edges[ek].target;
            }
            
            let type = classData.edges[ek].type;
            
            if (nodesToCheck[i] === undefined) {
                nodesToCheck[i] = {
                    nodeID: nodeToCheckID,
                    edges: []
                };
            }
            
            let newEdge = {
                type: type,
                direction: direction
            };
            
            if (objectData.edges[ek].subEdge !== undefined) {
                newEdge.subEdge = objectData.edges[ek].subEdge;
            }
            
            nodesToCheck[i].edges.push(newEdge);
        }

        return nodesToCheck;
    },
    
    // On node create, this function collects the connected external nodes where the available connection information has to be updated
    getNodesToUpdate: function(nodesToCheck, checkedNodes) {
        let nodesToUpdate = {};
        
        for (let ek in checkedNodes) {
            if (checkedNodes[ek] > 0) {
                let aera = ek.split('.');
                let nodeIndex = aera[0].substring(1);
                let fieldName = aera[1];
                if (nodesToUpdate[nodeIndex] === undefined) {
                    nodesToUpdate[nodeIndex] = {
                        nodeID: nodesToCheck[nodeIndex].nodeID,
                        edges: []
                    };
                }
                nodesToUpdate[nodeIndex].edges.push(fieldName);
            }
        }
        // console.log('nodesToUpdate', nodesToUpdate);
         
        return nodesToUpdate;
    },
    
    // 
    formatGetResult: function(result) {
        let ret = {};
        // console.log('formatGetResult', result);
        for (let rk in result) {
            let fus = rk.indexOf('_') + 1;
            let prefix = rk.substring(0, fus);
            let key = rk.substring(fus);

            if (prefix === 'in_') {
                if (ret.nodes === undefined) ret.nodes = {};
                ret.nodes[key] = this.formatNodeFields(result[rk]);
                if (ret.nodes[key].fields['class'] !== undefined) {
                    // console.log('Classing');
                    ret['class'] = ret.nodes[key].fields['class'];
                    delete ret.nodes[key].fields['class'];
                }
            }
            
            if (prefix === 'e_') {
                if (ret.edges === undefined) ret.edges = {};
                ret.edges[key] = result[rk];
                delete ret.edges[key].type;
                delete ret.edges[key].fields;
            }
        }
        
                    // console.log('ret', ret);
        return ret;
    },
    
    //
    formatCreateResult: function(result) {
        let ret = {};
        
        for (let rk in result) {
            let fus = rk.indexOf('_') + 1;
            let prefix = rk.substring(0, fus);
            let key = rk.substring(fus);
            
            if (prefix === 'in_') {
                if (ret.nodes === undefined) ret.nodes = {};
                ret.nodes[key] = this.formatNodeFields(result[rk]);
            }
            
            if (prefix === 'e_') {
                if (ret.edges === undefined) ret.edges = {};
                ret.edges[key] = result[rk];
            }
        }
        
        return ret;
    },
    
    formatNodeFields: function(n) {
        // if (n.fields['class'] !== undefined) {
            // n['class'] = n.fields['class'];
            // delete n.fields['class'];
        // }
        
        delete n.labels;
        
        for (let fk in n.fields) {
            const fieldNamePrefix = fk.substring(0,3);
            
            if (['ie_', 'oe_', 'nn_', 'ni_', 'in_', 'on_'].includes(fieldNamePrefix)) {
                delete n.fields[fk];
            }
            
            if (fieldNamePrefix === 'nf_') {
                n.fields[fk.substring(3)] = n.fields[fk];
                delete n.fields[fk];
            }
        }
        
        return n;
    },
    
    prepareUpdateParameters: function(oNew, oOld, c) {
        let ups = {
            nodesToBeDeleted: [],
            edgesToBeDeleted: [],
            newExternalNodes: [],
            newInternalNodes: [],
            newEdges: [],
            nodeFieldUpdates: {},
            nodeFieldDeletes: {}
        };

        // collect nodes (internal) to be deleted (when a node is present in the current but not in the new object)
        for (let nk in oOld.nodes) {
            if (oNew.nodes[nk] === undefined) {
                ups.nodesToBeDeleted.push(nk);
            }
        }

        // collect edges (internal + external) to be deleted (when an edge is present in the current but not in the new object)
        for (let ek in oOld.edges) {
            if (oNew.edges[ek] === undefined) {
                ups.edgesToBeDeleted.push(ek);
            }
        }
        
        for (let ek in oNew.edges) {
            if (oOld.edges[ek] === undefined) {
                // collect new edges
                ups.newEdges.push(ek);
                
                // collect new external nodes
                const eee = objectUtils.getEdgeExternalEndpoint(oNew.edges[ek]);
                if (eee !== undefined) {
                    ups.newExternalNodes.push(eee);
                }
            }
        }
        
        // collect new internal nodes
        for (let nk in oNew.nodes) {
            if (oOld.nodes[nk] === undefined) {
                ups.newInternalNodes.push(nk);
            }
        }

        // collect changed nodes and their changed fields
        for (let nk in oNew.nodes) {
            const on = oOld.nodes[nk];
            const nn = oNew.nodes[nk];
            
            // collect fields to be updated
            for (let fk in nn.fields) {
                if (nn.fields[fk] !== undefined  && (on.fields[fk] === undefined || on.fields[fk] !== nn.fields[fk])) {
                    if (ups.nodeFieldUpdates[nk] === undefined) ups.nodeFieldUpdates[nk] = [];
                    ups.nodeFieldUpdates[nk].push(fk);
                }
            }
            
            // collect fields to be deleted
            for (let fk in on.fields) {
                if (nn.fields[fk] === undefined) {
                    if (ups.nodeFieldDeletes[nk] === undefined) ups.nodeFieldDeletes[nk] = [];
                    ups.nodeFieldDeletes[nk].push(fk);
                }
            }
        }
        
        return ups;
    },
    
    // precondition: edge is valid
    isEdgeExternal: function(e) {
        return e.source !== undefined || e.target !== undefined;
    },
    
    // precondition: edge is valid
    getEdgeExternalEndpoint: function(e) {
        return (e.source === undefined && e.target === undefined) ? undefined : (e.source === undefined ? e.target : e.source);
    }
    
};

module.exports = objectUtils;