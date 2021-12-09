'use strict';

var classUtils = {

    getMainNodeKey: function(c) {
        let mainNodeKey;
        
        for (let ek in c.edges) {
            let e = c.edges[ek];
            if (e.type === 'H' && e.source === undefined) {
                return e.target;
            }
        }
    },
    
    // add calculated values to make life simpler
    addExtension: function(c) {
        for (let ek in c.edges) {
            let e = c.edges[ek];
            if (e.source === undefined || typeof e.source !== 'string' || e.target === undefined || typeof e.target !== 'string' ) {
                e.external = true;
            }
        }
        return c;
    },
    
    isEdgeExternal: function(e) {
        return e.source === undefined || e.target === undefined || typeof e.source !== 'string' || typeof e.target !== 'string';
    }
    
};

module.exports = classUtils;