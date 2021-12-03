'use strict';

var objectReadQuery = {

    className: 'objectReadQuery',
    
    // match all edges and their endnodes of startNodes
    getConnectedEdges: function(c, startNodes, aliasedNodes, aliasedEdges, externalNodeCount) {
        logger.log(this.className + '.getConnectedEdges', {type: 'function'});

        let query = '';
        let newNodes = [];
        
        for (let i=0; i<startNodes.length; i++) {
            const n = startNodes[i];
            
            for (let ek in c.edges) {
                const e = c.edges[ek];
                const edgeAlias = 'e_' + ek;
                
                if (!aliasedEdges.includes(edgeAlias) && (e.source === n || e.target === n) && e.multiple !== true) {
                    let qEdge;
                    let eNodeKey;
                    let eNodeAlias;
                    
                    if (e.source === n) {
                        qEdge = '-[' + edgeAlias + ':' + e.type + ']->';
                        eNodeKey = e.target;
                    } else 
                    if (e.target === n) {
                        qEdge = '<-[' + edgeAlias + ':' + e.type + ']-';
                        eNodeKey = e.source;
                    }
                    
                    query += 'OPTIONAL MATCH (in_' + n + ')';
                    query += qEdge;

                    // if edge is connected to an internal node
                    if (eNodeKey !== undefined) {
                        eNodeAlias = 'in_' + eNodeKey;
                        query += '(' + eNodeAlias + ':' + c.nodes[eNodeKey].label + ') ';
                        
                        newNodes.push(eNodeKey);
                    } 
                    // if edge is connected to an external node
                    else {
                        externalNodeCount++;
                        eNodeAlias = 'en_' + externalNodeCount;
                        query += '(' + eNodeAlias + ') ';
                    }
                    
                    if (!aliasedNodes.includes(eNodeAlias)) aliasedNodes.push(eNodeAlias);
                    aliasedEdges.push(edgeAlias);
                }
            }
        }
        
        if (newNodes.length > 0) query += this.getConnectedEdges(c, newNodes, aliasedNodes, aliasedEdges, externalNodeCount);
        
        return query;
    },
    
    get: function(params, c) {
        logger.log(this.className + '.get', {type: 'function'});

        let query = '';
        let mainNodeKey;
        let mainNodeAlias;
        // console.log('params', params);
        // console.log('c', utils.showJSON(c));

        // Locate main node
        for (let ek in c.edges) {
            const e = c.edges[ek];
            if (e.source === undefined && e.type === 'H') {
                mainNodeKey = e.target;
                mainNodeAlias = 'in_' + mainNodeKey;
            }
        }

        if (params.objectLabel !== undefined) {
            query += 'MATCH (' + mainNodeAlias + ':' + params.objectLabel + ') WHERE ' + mainNodeAlias + '.id="' + params.objectID + '" ';
        } else {
            query += 'MATCH (' + mainNodeAlias + ') WHERE ' + mainNodeAlias + '.id="' + params.objectID + '" ';
        }
        
        let startNodes = [mainNodeKey];
        let aliasedNodes = [mainNodeAlias];
        let aliasedEdges = [];
        
        query += this.getConnectedEdges(c, startNodes, aliasedNodes, aliasedEdges, 0);
        query += ' RETURN DISTINCT ';

        for (let i=0; i<aliasedNodes.length; i++) {
            query += aliasedNodes[i] + ',';
        }
        
        for (let i=0; i<aliasedEdges.length; i++) {
            query += aliasedEdges[i] + ',';
        }
        
        query = query.substring(0, query.length - 1);
        query += ';';
        
        console.log('query', query);
        return query;
    },
    
    findByEdge: function(destinationEdge) {
        logger.log(this.className + '.findByEdge', {type: 'function'});

        let fieldName = (destinationEdge.direction === 'in' ? 'ie_' : 'oe_') + destinationEdge.type;
        let query = 'MATCH (n) WHERE ';
        
        query += 'n.' + fieldName + '=-1 OR ' + 'n.' + fieldName + '>0 ';
        query += 'return n;';
        
        console.log('query', query);
        
        return query;
    }
    
};

module.exports = objectReadQuery;