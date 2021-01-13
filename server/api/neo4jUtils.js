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
// console.log('record', record);
        for (var i=0;i<record.keys.length;i++) {
            var fieldKey = record.keys[i];
            var fieldData = record._fields[record._fieldLookup[fieldKey]];
            
            // if field is Node
            if (fieldData.identity !== undefined) {
                res[fieldKey] = this.formatNode(fieldData);
            } else 
            // if field is Integer
            if (fieldData.low !== undefined) {
                res[fieldKey] = this.formatInteger(fieldData);
            } else 
            // other field types
            {
                res[fieldKey] = fieldData;
            }
        }
// console.log('res', res);
        
        if (options.singleRecord === true) {
            res = res[record.keys[0]];
        }
        
        return res;
    },
    
    // Format node
    formatNode: function(node) {
        let res = {};
        
        res.ID = this.formatInteger(node.identity);
        res.labels = node.labels;
        if (node.classID !== undefined) res.classID = node.classID;
        res.fields = {};
        
        for (let pk in node.properties) {
            const property = node.properties[pk];
            
            // if field is Integer
            if (property.low !== undefined) {
                res.fields[pk] = this.formatInteger(property);
            } else 
            // other field types
            {
                res.fields[pk] = property;
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