'use strict';

var classQuery = {

    create: function(data) {
        logger.log('classQuery.create', {type: 'function'});

        var fields = JSON.stringify(data.fields);
        var form = JSON.stringify(data.form);
        var list = utils.JSONToString(data.list);
        var filter = utils.JSONToString(data.filter);
        var edges = utils.JSONToString(data.edges);
        var events = utils.JSONToString(data.events);
        
        var query = '';
        
        if (data['extends'] !== undefined) {
            query += 'MATCH (c:Class) WHERE c.id="' + data['extends'].id + '" ';
        }
        
        if (data['defines'] !== undefined) {
            if (data['defines'].label !== undefined) {
                query += 'MATCH (d:' + data['defines'].label + ') WHERE d.id="' + data['defines'].id + '" ';
            } else {
                query += 'MATCH (d) WHERE d.id="' + data['defines'].id + '" ';
            }
        }
        
        query += 'CREATE (n:Class{';
        query += 'id:apoc.create.uuid(),';
        query += 'label:"' + data.label + '"';
        
        if (data.name !== undefined) {
            query += 'name:"' + data.name + '",';
        }
        
        if (fields !== undefined) 
            query += ",fields:'" + fields + "'";
        
        if (form !== undefined) 
            query += ",form:'" + form + "'";
        
        if (list !== undefined) 
            query += ",list:'" + list + "'";
        
        if (edges !== undefined) 
            query += ",edges:'" + edges + "'";
        
        if (events !== undefined) 
            query += ", events:'" + events + "'";
        
        query += '})';
        
        if (data['extends'] !== undefined) {
            query += '-[:E]->(c)';
        }
        
        if (data['defines'] !== undefined) {
            query += '<-[:D]-(d)';
        }
        
        query += ' RETURN n;';
        console.log('query', query);

        return query;
    },
    
    getCurrent: function(data) {
        logger.log('classQuery.getCurrent', {type: 'function'});
        
        var query = '';
        query += 'MATCH (n:Class) ';
        
        if (!utils.isEmpty(params.name)) {
            query += 'WHERE toLower(n.name) CONTAINS toLower("' + params.name + '") ';
        }
        
        if (params.container !== undefined) {
            query += 'MATCH (n)<-[:DEFINES]-(c) ';
            query += 'WHERE ID(c) = ' + params.container.id + ' ';
        }
        
        query += 'RETURN ID(n) as id, n.name as name, n.label as label';
        
        return query;
    },
    
    update: function(data) {
        logger.log('classQuery.update', {type: 'function'});

        var fields = JSON.stringify(data.fields);
        var form = JSON.stringify(data.form);
        var list;
        var filter;
        var edges;
        var events;
        var query = '';
        
        if (!utils.isEmpty2(data.list)) list = JSON.stringify(data.list);
        if (!utils.isEmpty2(data.filter)) filter = JSON.stringify(data.filter);
        if (!utils.isEmpty2(data.edges)) edges = JSON.stringify(data.edges);
        if (!utils.isEmpty2(data.events)) events = JSON.stringify(data.events);

        var query = '';
        
        query += 'MATCH (c:Class) WHERE ID(c)=' + data.id + ' ';
        
        if (data['extends'] !== undefined) {
            query += 'MATCH (p:Class) WHERE ID(p)=' + data['extends'].id + ' ';
        }
        
        if (data['defines'] !== undefined) {
            query += 'MATCH (d) WHERE ID(d)=' + data['defines'].id + ' ';
        }
        
        query += 'OPTIONAL MATCH (c)-[eoe:EXTENDS]->(co:Class) ';
        query += 'OPTIONAL MATCH (c)<-[doe:DEFINES]-(do) ';
        query += 'SET ';
        query += "c.name = '" + data.name + "'";
        query += ",c.label = '" + data.label + "'";
        
        if (fields !== undefined) 
            query += ",c.fields = '" + fields + "'";
        
        if (edges !== undefined) 
            query += ",c.edges = '" + edges + "'";
        
        if (form !== undefined) 
            query += ",c.form = '" + form + "'";
        
        if (list !== undefined) 
            query += ",c.list = '" + list + "'";
        
        if (filter !== undefined) 
            query += ",c.filter = '" + filter + "'";
        
        if (events !== undefined) 
            query += ", c.events = '" + events + "'";
        
        query += ' DELETE eoe';
        query += ' DELETE doe';
        
        if (data['extends'] !== undefined) {
            query += ' CREATE (c)-[ee:EXTENDS]->(p)';
        }
        
        if (data['defines'] !== undefined) {
            query += ' CREATE (c)<-[de:defines]-(d)';
        }
        
        query += ' RETURN c';
        
        console.log('query', query);
        
        return query;
    },
    
    find: function(params) {
        logger.log('classQuery.find', {type: 'function'});
        console.log('params', params);
        
        var query = '';
        query += 'MATCH (n:Class) ';
        
        if (!utils.isEmpty(params.name)) {
            query += 'WHERE toLower(n.name) CONTAINS toLower("' + params.name + '") ';
        }
        
        if (params.container !== undefined) {
            query += 'MATCH (n)<-[:DEFINES]-(c) ';
            query += 'WHERE ID(c) = ' + params.container.id + ' ';
        }
        
        query += 'RETURN ID(n) as id, n.name as name, n.label as label';

        if (params.fields !== undefined) {
            query += ', n.fields AS fields';
        }
        
        if (params.edges !== undefined) {
            query += ', n.edges AS edges';
        }
        
        if (params.form !== undefined) {
            query += ', n.form AS form';
        }
        
        if (params.list !== undefined) {
            query += ', n.list AS list';
        }
        
        if (params.filter !== undefined) {
            query += ', n.filter AS filter';
        }
        
        if (params.sort !== undefined) {
            if (params.sort === '+name') {
                query += ' ORDER BY n.name ASC';
            } else 
            if (params.sort === '-name') {
                query += ' ORDER BY n.name DESC';
            }
        }
        
        console.log('query', query);
        
        return query;
    },

    get: function(filter, options) {
        logger.log('classQuery.get', {type: 'function'});
        var query = '';
        
        switch (options.mode) {
            // Just the node
            case 'simple':
                query += 'MATCH (n:Class) WHERE ID(n)=' + filter.id + ' ';
                query += 'OPTIONAL MATCH (n)<-[:DEFINES]-(c) ';
                query += 'RETURN ID(n) AS id';
                query += ', n.name AS name';
                query += ', n.label AS label';
                query += ', n.fields AS fields';
                query += ', n.edges AS edges';
                query += ', n.list AS list';
                query += ', n.form AS form';
                query += ', n.filter AS filter';
                query += ', ID(c) AS containerId';
                query += ', c.name AS containerName';
                break;
            // Node with inherited values
            case 'inherited':
                // @TODO update to v2
                query += 'MATCH (n:Class) WHERE ID(n)=' + filter.id + ' ';
                query += 'OPTIONAL MATCH (n)<-[:DEFINES]-(c) ';
                query += 'RETURN ID(n) AS id';
                query += ', n.name AS name';
                query += ', n.label AS label';
                query += ', n.fields AS fields';
                query += ', n.edges AS edges';
                query += ', n.list AS list';
                query += ', n.form AS form';
                query += ', n.filter AS filter';
                query += ', ID(c) AS containerId';
                query += ', c.name AS containerName';
                break;
        }
        console.log('query', query);

        return query;
    },

    get2: function(options) {
        logger.log('classQuery.get2', {type: 'function'});
        if (options === undefined) options = {};
        
        var query = '';
        
        if (options.mode === 'inherited') {
            // @TODO update to v2
            query += 'MATCH (n:Class) WHERE ID(n) = $classId ';
            query += 'OPTIONAL MATCH (n)<-[:DEFINES]-(c) ';
            query += 'RETURN ID(n) AS id';
            query += ', n.name AS name';
            query += ', n.label AS label';
            query += ', n.fields AS fields';
            query += ', n.edges AS edges';
            query += ', n.list AS list';
            query += ', n.form AS form';
            query += ', n.filter AS filter';
            query += ', ID(c) AS containerId';
            query += ', c.name AS containerName';
        } else {
            // Simple mode
            query += 'MATCH (n:Class) WHERE ID(n) = $classId ';
            query += 'OPTIONAL MATCH (n)<-[:DEFINES]-(c) ';
            query += 'RETURN ID(n) AS id';
            query += ', n.name AS name';
            query += ', n.label AS label';
            query += ', n.fields AS fields';
            query += ', n.edges AS edges';
            query += ', n.list AS list';
            query += ', n.form AS form';
            query += ', n.filter AS filter';
            query += ', ID(c) AS containerId';
            query += ', c.name AS containerName';
        }
        console.log('query', query);

        return query;
    }

};

module.exports = classQuery;