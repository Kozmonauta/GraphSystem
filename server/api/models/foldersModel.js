'use strict';

var foldersModel = {
    id: {
        type: String
    },
    
    name: {
        type: String
    },
    
    created: {
        type: String
    },
    
    add: function(data, success, error) {
        var folders = data.folders ? JSON.stringify(data.folders) : '';
        var query = '';

        query += 'CREATE (n:Folders{';
        query += "items:'" + folders + "'";
        query += '})';
        query += ' RETURN n';

        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    success(res);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            })
        ;
    },
    
    update: function(data, success, error) {
        var folders = data.folders ? JSON.stringify(data.folders) : '';
        var query = '';
        query += 'MATCH (n:Folders) WHERE ID(n)=' + data.id + ' ';
        query += 'SET ';
        query += "n.items = '" + folders + "'";
        query += ' RETURN n';
        
        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    success(res);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            });
    },
    
    find: function(params, success, error) {
        logger.log('foldersModel.find', {type: 'function'});
        
        var query = '';
        
        if (params.pid !== undefined) {
            query += 'MATCH (f:Folders)<-[:USES_FOLDERS]-(p:Profile) WHERE ID(p)=' + params.pid + ' ';
            query += 'RETURN ID(f), f.items';
        } else {
            error({});
        }
        console.log('query', query);

        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var item = {
                        id: res._fields[0].low,
                        items: res._fields[1],
                        actions: 'rud'
                    };
                    list.push(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                    if (errors === undefined) {
                        success(list);
                    } else {
                        error(errors);
                    }
                },
                onError: function (err) {
                    errors = err;
                    error(errors);
                }
            })
        ;
    },
    
    findForUser: function(params, success, error) {
        logger.log('foldersModel.findForUser', {type: 'function'});
        var query = '';
        
        if (params.pid !== undefined) {
            query += 'MATCH (p:Profile) WHERE ID(p)=' + params.pid + ' ';
            query += 'RETURN ID(p) AS profileId, p.name AS profileName, p.actions AS profileActions, p.folders AS items';
        } else {
            error({});
        }
        console.log('query', query);

        var list = [];
        var neo4jSession = neo4jDriver.session();
        var errors;
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var item = utils.getDbItem(res);
                    success(list);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            })
        ;
    },
    
    get: function(params, success, error) {
        var query = '';
        
        if (params.pid !== undefined) {
            query += 'MATCH (f:Folders)<-[:HAS]-(p:Profile) WHERE ID(p)=' + params.pid + ' ';
            query += 'RETURN ID(f), f.name, f.items';
        } else {
            error({});
        }

        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var folders = res._fields[2] ? JSON.parse(res._fields[2]) : undefined;
                    folders = utils.fixBooleans(folders);
                    
                    var item = {
                        id: res._fields[0].low,
                        name: res._fields[1],
                        folders: folders,
                        actions: 'rud'
                    };
                    
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            })
        ;
    },

    delete: function(id, success, error) {
        var query = '';
        query += 'MATCH (n:Folders) WHERE ID(n)=' + id + ' ';
        query += 'DELETE n RETURN true';

        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    success(res);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    error(err);
                }
            })
        ;
    }
    
};

module.exports = foldersModel;