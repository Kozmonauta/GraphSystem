var utils = {

    returnError: function(res) {
        res.status(400);
        res.json({
            "errors": [
                {
                    "message": texts.system.create.error
                }
            ]
        });
    },
    
    isEmpty: function(v) {
        return v === undefined || v === null || v === '' || v.length === 0 || Object.keys(v).length === 0;
    },
    
    isEmpty2: function(v) {
        return v === undefined || v === null || v === '';
    },
    
    JSONToString: function(v) {
        return this.isEmpty(v) ? undefined : JSON.stringify(v);
    },
    
    isTrue: function(v) {
        return v === true || v === "true";
    },
    
    mergeObjects: function(o1, o2, options) {
        if (o1 === undefined) o1 = {};
        if (o2 === undefined) o2 = {};
        
        for (var k in o2) {
            if ((o2[k] !== undefined && o2[k] !== null) || options === undefined || !options.skipEmpty) {
                o1[k] = o2[k];
            }
        }
        return o1;
    },
    
    // Format node which is queried from Neo4j
    formatNode: function(n) {
        if (n === undefined) return undefined;
        let ret = {};
        
        if (n.properties !== undefined) {
            const jsonFields = ["fields", "edges", "form", "list", "events"];
            for (let pk in n.properties) {
                if (jsonFields.indexOf(pk) !== -1) {
                    ret[pk] = JSON.parse(n.properties[pk]);
                } else {
                    ret[pk] = n.properties[pk];
                }
            }
        }
        
        return ret;
    },
    
    // Adds brackets, quotes to query variable string based on its type
    formatField: function(p) {
        var s = '';
        
        if (this.isEmpty(p)) {
            s += 'null';
            return s;
        } else 
        
        // If field is array
        if (Array.isArray(p)) {
            s += '[';
            for (var i=0;i<p.length;i++) {
                if (!isNaN(p[i])) {
                    s += '' + p[i] + '';
                } else {
                    s += '"' + p[i] + '"';
                }
                if (i < p.length - 1) {
                    s += ',';
                }
            }
            s += ']';
        } else 
        // If field is number
        if (!isNaN(p)) {
            s += '' + p + '';
        } else {
            if (p.indexOf('"') !== -1) {
                s += "'" + p + "'";
            } else {
                s += '"' + p + '"';
            }
        }

        return s;
    },
    
    getDbItem: function(dbRecord) {
        console.log('getDbItem', dbRecord);
        var result;
        
        if (dbRecord.keys.length === 1) {
            var fieldKey = dbRecord.keys[i]
            var fieldData = dbRecord._fields[dbRecord._fieldLookup[fieldKey]];
            
            // if object is Node
            if (fieldData.identity !== undefined) {
                result = this.formatDbNode(fieldData);
            } else 
            // if object is Integer
            if (fieldData.low !== undefined) {
                result = fieldData.low;
            } else {
                result = fieldData;
            }
        } else {
            var result = [];
            for (var i=0;i<dbRecord.keys.length;i++) {
                var fieldKey = dbRecord.keys[i];
                var fieldData = dbRecord._fields[dbRecord._fieldLookup[fieldKey]];
                
                items.push(this.formatDbNode(fieldData));
            }
        }
    },
    
    // Format neo4j node to gs node
    formatDbNode: function(dbNode) {
        console.log('formatDbNode', dbNode);
        
        var node = {
            "ID": dbNode.identity.low,
            "labels": dbNode.labels,
            "fields": dbNode.properties
        };
        
        console.log('node', node);
        return node;
    },
    
    // options:
    //   fields: array of keys to include in the result; default: include all
    //   keyLeftTrim: trim characters from the beginning of the item keys
    getDbItemArray: function(data, options) {
        if (options === undefined) options = {};
        // console.log('getDbItem', data);
        
        var item = [];
        
        for (var i=0;i<data.keys.length;i++) {
            // if (options.fields !== undefined && !options.fields.includes(data.keys[i])) continue;
            
            var field = data._fields[data._fieldLookup[data.keys[i]]];
            if (field !== undefined && field !== null) {
                // @TODO better type handling
                if (field.low !== undefined) {
                    item.push(parseInt(field.toString()));
                } else {
                    item.push(field);
                }
            } else {
                item.push(null);
            }
        }

        return item;
    },
    
    // If "res" != null then item is pushed to res.items else to a new object
    addItem: function(item, res) {
        if (res === undefined) {
            res = {
                items: []
            };
        }
        res.items.push(item);
        
        return res;
    },
    
    addError: function(item, res) {
        item.type = 'error';
        
        if (item.code === undefined) {
            item.code = 'error';
        }
        
        this.addItem(item, res);
        res.valid = false;
        
        return res;
    },
    
    addSuccess: function(item, res) {
        if (item.type !== 'success') {
            item.type = 'success';
        }
        
        if (item.code === undefined) {
            item.code = 'success';
        }
        
        this.addItem(item, res);
        
        return res;
    },
    
    addWarning: function(item, res) {
        if (item.type !== 'warning') {
            item.type = 'warning';
        }
        
        if (item.code === undefined) {
            item.code = 'warning';
        }
        
        this.addItem(item, res);
        
        return res;
    },
    
    fixBooleans: function(o) {
        for (var k in o) {
            if (o[k] instanceof Object) {
                o[k] = this.fixBooleans(o[k]);
            } else 
            if (typeof o[k] === 'string') {
                if (o[k].toLowerCase() === 'false') {
                    o[k] = false;
                } else 
                if (o[k].toLowerCase() === 'true') {
                    o[k] = true;
                }
            }
        }
        return o;
    },

    replaceAt: function(s, index, replacement) {
        return s.substr(0, index) + replacement + s.substr(index + replacement.length);
    },
    
    formToObject: function(formData, classData) {
        var o = formData;
        
        o.edges = {};
        for (var nk in formData.nodes) {
            var node = formData.nodes[nk];
            var nodeClass = classData.nodes[nk];
            
            for (var pk in node) {
                var property = node[pk];
                if (!nodeClass.properties[pk] !== undefined && classData.edges[pk] !== undefined) {
                    o.edges[pk] = property;
                    delete node[pk];
                }
            }
        }
        
        return o;
    },
    
    objectToForm: function(objectData, classData) {
        var f = {};
        return f;
    },

    // timestamp => human formatted
    formatDate: function(e, f) {
        var date = new Date(parseInt(e));
        var r;
        switch (f) {
            case 'Y.m.d':
                r = date.getFullYear() + '.' + this.fillZeros(date.getMonth() + 1, 2) + '.' + this.fillZeros(date.getDate(), 2);
                break;
            case 'H:i':
                r = this.fillZeros(date.getHours(), 2) + ':' + this.fillZeros(date.getMinutes(), 2);
                break;
            case 'Y.m.d H:i':
                r = date.getFullYear() + 
                    '.' + 
                    this.fillZeros(date.getMonth() + 1, 2) + 
                    '.' + 
                    this.fillZeros(date.getDate(), 2) + ' ' + 
                    this.fillZeros(date.getHours(), 2) + ':' + this.fillZeros(date.getMinutes(), 2);
                break;
            case 'Y.m.d H:i:s':
                r = date.getFullYear() + 
                    '.' + 
                    this.fillZeros(date.getMonth() + 1, 2) + 
                    '.' + 
                    this.fillZeros(date.getDate(), 2) + ' ' + 
                    this.fillZeros(date.getHours(), 2) + ':' + this.fillZeros(date.getMinutes(), 2) + ':' + this.fillZeros(date.getSeconds(), 2);
                break;
        }
        return r;
    },
    
    inheritData(oneData, allData) {
        if (oneData['extends'] === undefined) {
            return oneData;
        } else 
        if (Array.isArray(oneData['extends'])) {
            for (ek=0;ek<oneData['extends'].length;ek++) {
            }
            return;
        }
        
        var allDataKeys = Object.keys(allData);
        var dataDone = [];
        var parentKey = oneData['extends'];

        for (ak in allData) {
            var pak = '$' + ak;
            if (pak === parentKey) {
            }
        }
        
        var ak = allDataKeys[0];
        while (allData[ak]['extends'] !== undefined) {
        }
        
        
    }
    
}

module.exports = utils;