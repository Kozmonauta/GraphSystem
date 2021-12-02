'use strict';

var objectUtils = {

    // Collect the nodes (main nodes of objects) and their required available edge fields so they can be connected to the actual object
    getNodesToCheck: function(objectData, classData) {
        let nodesToCheck = {};
        let i = 0;
        
        for (let ek in objectData.edges) {
            i++;
            let direction;
            let nodeToCheckID;

            if (objectData.edges[ek].target !== undefined) {
                direction = 'in';
                nodeToCheckID = objectData.edges[ek].target;
            } else {
                direction = 'out';
                nodeToCheckID = objectData.edges[ek].source;
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
        // console.log('nodesToCheck', utils.showJSON(nodesToCheck));

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
            }
            
            if (prefix === 'e_') {
                if (ret.edges === undefined) ret.edges = {};
                ret.edges[key] = result[rk];
                delete ret.edges[key].fields;
            }
        }
        
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
        if (n.fields['class'] !== undefined) {
            n['class'] = n.fields['class'];
            delete n.fields['class'];
        }
        
        // delete ret.nodes[key].name;
        
        for (let fk in n.fields) {
            const field2chars = fk.substring(0,2);
            const field3chars = fk.substring(0,3);
            
            if (['_i', '_o'].includes(field2chars) || ['_ie', '_oe', '_nn', '_ni'].includes(field3chars)) {
                delete n.fields[fk];
            }
            
            if (field2chars === '_f') {
                n.fields[fk.substring(3)] = n.fields[fk];
                delete n.fields[fk];
            }
        }
        
        return n;
    }
    
};

module.exports = objectUtils;