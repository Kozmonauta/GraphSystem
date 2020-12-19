'use strict';

var systemQuery = {

    create: function(classes, objects) {
        var query = '';
        
        query += 'CREATE (core:Core) ';
        query += this.attachD('core', classes);
        query += this.attachE(classes);
        query += this.createObjects(classes, objects);
        
        query += 'RETURN core AS core,';
        
        for (var ck in classes) {
            query += ck + ' AS ' + ck + ',';
        }
        for (var ok in objects) {
            query += ok + ' AS ' + ok + ',';
        }
        query = query.substring(0, query.length - 1) + ';';
        
        return query;
    },
    
    createObjects: function(classes, objects) {
        var query = '';
        
        for (var ok in objects) {
            var o = objects[ok];
            var c;
            for (var ck in classes) {
                if (o.classID === classes[ck].id) {
                    c = classes[ck];
                }
            }
            
            var objectDataString;
            query += 'CREATE (' + ok + ':' + c.label + '{' + objectDataString + '}') ';
        }
        
        return query;
    },
    
    attachD: function(key, classes) {
        var query = '';

        for (var ck in classes) {
            var c = classes[ck];

            var classData = {
                "label": c.label,
                "name": c.name,
                "fields": c.fields,
                "edges": c.edges
            };
            
            if (c['abstract'] === true) {
                classData['abstract'] = true;
            }
            
            var classDataString = '';
            for (var pk in classData) {
                classDataString += pk + ':' + utils.formatField(classData[pk]) + ',';
            }
            classDataString = classDataString.substring(0, classDataString.length - 1);
            
            if (c['definer'] === ('$' + key)) {
                if (c.createdInQuery === undefined) {
                    query += 'CREATE (' + key + ')-[:D]->(' + ck + ':Class{' + classDataString + '}) ';
                    c.createdInQuery = true;
                } else {
                    query += 'CREATE (' + key + ')-[:D]->(' + ck + ') ';
                }
            }
        }
        
        return query;
    },
    
    attachE: function(classes) {
        var query = '';
        
        for (var ck in classes) {
            var c = classes[ck];
            if (c['extends'] !== undefined) {
                if (typeof c['extends'] === 'string') {
                    var classKey = c['extends'].substring(1);
                    query += 'CREATE (' + ck + ')-[:E]->(' + classKey + ') ';
                } else {
                    for (var ek in c['extends']) {
                        var classKey = c['extends'][ek].substring(1);
                        query += 'CREATE (' + ck + ')-[:E]->(' + classKey + ') ';
                    }
                }
            }
        }
        
        return query;
    }
    
};

module.exports = systemQuery;