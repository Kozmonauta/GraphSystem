'use strict';

var systemQuery = {

    getCore: function() {
        return 'MATCH (Core:Core) RETURN Core AS Core LIMIT 1;';
    },
    
    createCore: function() {
        return 'CREATE (Core:Core) RETURN Core AS Core;';
    },
    
    getInheritClasses: function(core) {
        return 'MATCH (c:Class)<-[:D]-(core:Core) WHERE ID(core)=' + core.ID + ' RETURN ID(c) AS ID, dn.collectInheritData(toString(ID(c)),"Class","E","out",null) AS Class;';
        // return 'MATCH (c:Class)<-[:D]-(core:Core) RETURN dn.collectInheritData(toString(ID(c)),"Class","E","out",null) AS Class;';
    },
    
    createClasses: function(classes, core) {
        var query = '';
        
        query += 'MATCH (core:Core) WHERE ID(core) = ' + core.ID + ' ';
        
        for (var ck in classes) {
            var c = classes[ck];
            var classData = {
                "labels": c.labels,
                "name": c.name,
                "abstract": c['abstract'],
                "fields": c.fields,
                "edges": c.edges
            };
            
            var classDataString = '';
            for (var pk in classData) {
                classDataString += pk + ':' + utils.formatField(classData[pk]) + ',';
            }
            classDataString = classDataString.substring(0, classDataString.length - 1);
            
            query += 'CREATE (core)-[:D]->(' + ck + ':Class{' + classDataString + '}) ';
        }
        
        for (var ck in classes) {
            var c = classes[ck];
            if (c['extends'] === undefined) continue;
            var es = Array.isArray(c['extends']) ? c['extends'] : [c['extends']];
            
            for (var ek in es) {
                // $ means the class was defined in this same request, now other types are not handled
                if (es[ek][0] !== '$') continue;
                
                var parentClass;
                var pk = es[ek].substring(1);
                if (classes[pk] !== undefined) {
                    query += 'CREATE (' + ck + ')-[:E]->(' + pk + ') ';
                }
            }
        }
        
        query += 'RETURN ';
        
        for (var ck in classes) {
            query += 'ID(' + ck + ') AS ' + ck + 'ID,';
        }
        
        query = query.substring(0, query.length - 1) + ';';
        
        return query;
    },
    
    createObjects: function(classes, objects) {
        var query = '';
        
        return query;
    },
    
};

module.exports = systemQuery;