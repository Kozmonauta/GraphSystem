'use strict';

var objectModel = require('../models/objectModel');
var async = require('async');

exports.mergeClass = function(objectData, classData) {
    if (classData.events !== undefined) {
        if (objectData.events === undefined) {
            objectData.events = [];
        }
        objectData.events = classData.events.concat(objectData.events);
    }
    
    if (classData.edges !== undefined) {
        if (objectData.edges === undefined) {
            objectData.edges = {};
        }
        for (var ek in classData.edges) {
            if (objectData[ek] !== undefined) {
                
                objectData[ek] = classData.edges[ek];
            }
        }
    }
    return objectData;
};

// neo4j db format --> api format
exports.decodeObject = function(dbItem) {
    console.log('dbItem', dbItem);
    var objectData = {
        // TODO handle 64 bit int
        id: dbItem.identity.low,
        label: dbItem.properties.label,
        name: dbItem.properties.name,
        edges: dbItem.properties.edges,
        fields: dbItem.properties.fields
    };
    
    return classData;
};

