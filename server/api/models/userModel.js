'use strict';

var userModel = {
    
    // get by profile id
    getById: function(data, success, error, completed) {
        var query = '';
        query += 'MATCH (p:Profile) WHERE ID(p) = ' + data.id + ' ';
        query += 'RETURN p.email, p._classId, p.actions, ID(p), p.name, p.folders';
        
        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = {
                        email: data._fields[0],
                        classId: data._fields[1].low,
                        actions: data._fields[2],
                        pid: data._fields[3].low,
                        name: data._fields[4],
                        folders: JSON.parse(data._fields[5])
                    };
                    console.log('A"CTIONS item.type', typeof item.actions);
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                    completed();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    },
    
    getByEmail: function(data, success, error, completed) {
        var query = '';
        query += 'MATCH (p:Profile) WHERE p.email = "' + data.email + '" ';
        query += 'RETURN p.email, p.password, p._classId, p.actions, ID(p), p.name';
        console.log('getByEmail q', query);
        var neo4jSession = neo4jDriver.session();
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (data) {
                    var item = {
                        email: data._fields[0],
                        password: data._fields[1],
                        classId: data._fields[2].low,
                        actions: data._fields[3],
                        pid: data._fields[4].low,
                        name: data._fields[5]
                    };
                    
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                    completed();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    },
    
    updateActions: function(filter, actions, success, error) {
        // console.log('Profile addActions', filter, actions);
        
        var query = '';
        for (var i=0;i<actions.length;i++) {
            actions[i] = '"' + actions[i] + '"';
        }
        query += 'MATCH (p:Profile) WHERE ID(p)=' + filter.id + ' ';
        query += 'SET p.actions = [' + actions + '] ';
        query += 'RETURN p.actions';
        // console.log('query', query);
        var neo4jSession = neo4jDriver.session();
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var item = {
                        actions: res._fields[0]
                    };
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    },
    
    updateFolders: function(filter, folders, success, error) {
        // console.log('Profile addActions', filter, actions);
        
        var query = '';
        query += 'MATCH (p:Profile) WHERE ID(p)=' + filter.id + ' ';
        query += 'SET p.folders = [' + actions + '] ';
        query += 'RETURN p.actions';
        // console.log('query', query);
        var neo4jSession = neo4jDriver.session();
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var item = {
                        actions: res._fields[0]
                    };
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    },
    
    activateAccount: function(data, success, error, completed) {
        console.log('userModel.activateAccount', data);
        
        var query = '';
        query += 'MATCH (p:Profile) WHERE p._activationToken="' + data.token + '" ';
        query += 'SET p.password="' + data.password + '" ';
        query += 'REMOVE p._activationToken ';
        query += 'RETURN p.email';
        
        console.log('query', query);
        var neo4jSession = neo4jDriver.session();
        
        neo4jSession
            .run(query)
            .subscribe({
                onNext: function (res) {
                    var item = {
                        email: res._fields[0]
                    };
                    success(item);
                },
                onCompleted: function () {
                    neo4jSession.close();
                    completed();
                },
                onError: function (err) {
                    console.log('error', err);
                    error(err);
                }
            })
        ;
    }

};

module.exports = userModel;