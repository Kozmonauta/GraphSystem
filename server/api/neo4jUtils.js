var neo4jUtils = {

    formatRecords: function(records, options) {
        var res = [];
        for (var i=0;i<records.length;i++) {
            res.push(this.formatRecord(records[i], options));
        }
        return res;
    },
    
    formatRecord: function(record, options) {
        if (options === undefined) options = {};
        var res = {};
// console.log('FR', utils.showJSON(record));
        for (var i=0;i<record.keys.length;i++) {
            var fieldKey = record.keys[i];
            var fieldData = record._fields[record._fieldLookup[fieldKey]];
            
            // if field is Node
            if (fieldData !== null && fieldData.identity !== undefined) {
                res[fieldKey] = this.formatNode(fieldData);
            } else 
            // if field is Integer
            if (fieldData !== null && fieldData.low !== undefined) {
                res[fieldKey] = this.formatInteger(fieldData);
            } else 
            // other field types
            {
                res[fieldKey] = fieldData;
            }
        }
        
        if (options.singleRecord === true) {
            res = res[record.keys[0]];
        }
        
        return res;
    },
    
    // Format node
    formatNode: function(node) {
        let res = {};
        // console.log('node', node);
        // res.ID = this.formatInteger(node.identity);
        // res.id = res.
        res.labels = node.labels;
        if (node.classID !== undefined) res.classID = node.classID;
        res.fields = {};
        
        for (let pk in node.properties) {
            const property = node.properties[pk];
            
            if (pk === 'id') {
                res['id'] = property;
            } else 
            if (pk === '_classId') {
                res['classId'] = property;
            } else 
            if (['_creator', '_createdOn'].includes(pk)) {
                res[pk] = property;
            } else {
                // if field is Integer
                if (property.low !== undefined) {
                    res.fields[pk] = this.formatInteger(property);
                } else 
                // other field types
                {
                    res.fields[pk] = property;
                }
            }
        }
        
        return res;
    },
    
    formatInteger: function(i) {
        // TODO do it better
        return i.low;
    }
    
}

module.exports = neo4jUtils;