'use strict';

var systemQuery = {

    getCore: function() {
        return 'MATCH (Core:Core) RETURN Core AS Core LIMIT 1;';
    },
    
    createCore: function() {
        return 'CREATE (Core:Core{id:apoc.create.uuid()}) RETURN Core.id AS id;';
    },
    
    getInheritClasses: function(core) {
        return 'MATCH (c:Class)<-[:D]-(core:Core) WHERE core.id="' + core.id + '" RETURN dn.collectInheritData(c.id,"Class","E","out",null) AS Class;';
    },
    
    createClasses: function(classes, core) {
        var query = '';
        
        query += 'MATCH (core:Core) WHERE core.id = "' + core.id + '" ';
        
        for (var ck in classes) {
            var c = classes[ck];
            var classData = {
                "name": c.name,
                "abstract": c['abstract'],
                "labels": c.labels,
                "edges": c.edges,
                // "nodes": c.nodes,
                "fields": c.fields,
                "actions": c.actions
            };
            
            var classDataString = '';
            for (var pk in classData) {
                classDataString += pk + ':' + utils.formatField(classData[pk]) + ',';
            }
            classDataString = classDataString.substring(0, classDataString.length - 1);
            
            query += 'CREATE (core)-[:D]->(' + ck + ':Class{id:apoc.create.uuid(),' + classDataString + '}) ';
        }
        
        // Handle "extends" in the same request
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
            query += ck + '.id AS ' + ck + 'Id,';
        }
        
        query = query.substring(0, query.length - 1) + ';';
        // console.log(query);
        
        return query;
    },
    
    createObjects: function(classes, objects) {
        var query = '';
        
        return query;
    },
    
    // Erases database
    clear: function() {
        var query = 'MATCH (n) WITH n LIMIT 10000 DETACH DELETE n RETURN count(*);';
        
        return query;
    }
    
};

module.exports = systemQuery;