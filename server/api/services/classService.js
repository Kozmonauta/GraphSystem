'use strict';

exports.decodeClassList = function(dbList) {
    var records = {};

    for (var k in dbList.keys) {
        var key = dbList.keys[k];
        records[key] = this.decodeClass(dbList._fields[dbList._fieldLookup[key]]);
    }
    
    return records;
};

// neo4j db format --> api format
exports.decodeClass = function(dbItem) {
    console.log('dbItem', dbItem);
    var classData = {
        // TODO handle 64 bit int
        id: dbItem.identity.low,
        label: dbItem.properties.label,
        name: dbItem.properties.name,
        edges: dbItem.properties.edges,
        fields: dbItem.properties.fields
    };
    
    return classData;
};

// propertyName example: Profile.name (node), parent.name (edge)
exports.getProperty = function(classData, propertyName) {
    var pns = propertyName.split('.');
    
    if (classData.nodes[pns[0]] !== undefined && classData.nodes[pns[0]].properties[pns[1]] !== undefined) {
        return classData.nodes[pns[0]].properties[pns[1]];
    } else 
    if (classData.edges[pns[0]] !== undefined && classData.edges[pns[0]][pns[1]] !== undefined) {
        return classData.edges[pns[0]][pns[1]];
    }
};

exports.getExternalClassIds = function(classData) {
    var classIds = [];
    
    for (var ck in classData.connections) {
        var cId = classData.connections[ck].connected.classId;
        if (!utils.isEmpty(cId)) {
            classIds.push(cId);
        }
    }
    
    return classIds;
};

// labels example: [{id:1, label:"User"}]
exports.fillExternalClassLabels = function(classData, labels) {
    for (var ck in classData.connections) {
        for (var i=0;i<labels.length;i++) {
            if (labels[i].id === parseInt(classData.connections[ck].connected.classId)) {
                classData.connections[ck].connected.label = labels[i].label;
            }
        }
    }
    
    return classData;
};

// exports.stringifyJSONs = function(classData) {
    // for (var nk in classData.nodes) {
        // for (var pk in classData.nodes[nk].properties) {
            // if (classData.nodes[nk].properties[pk].accountInfo) {
                // classData.nodes[nk].properties[pk].accountInfo = JSON.stringify(classData.nodes[nk].properties[pk].accountInfo);
            // }
        // }
    // }
    // return classData;
// };

// exports.parseJSONs = function(classData) {
    // for (var nk in classData.nodes) {
        // for (var pk in classData.nodes[nk].properties) {
            // if (classData.nodes[nk].properties[pk].accountInfo) {
                // classData.nodes[nk].properties[pk].accountInfo = JSON.parse(classData.nodes[nk].properties[pk].accountInfo);
            // }
        // }
    // }
    // return classData;
// };

// collects provided connections of edgeClasses
exports.collectEdgeConnections = function(classData) {
    var ret = {
        _ies: [],
        _oes: []
    };
    
    for (var ck in classData.connections) {
        var c = classData.connections[ck];
        var s = c.label;
        
        if (c.connected.classId !== undefined && c.connected.classId !== '*') {
            s += '.' + c.connected.classId;
        }

        if (c.direction === 'out') {
            ret._oes.push(s);
        } else
        if (c.direction === 'in') {
            ret._ies.push(s);
        }
    }
    
    return ret;
};
