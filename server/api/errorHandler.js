var util = require('util');

var errorHandler = {

    GSError: function(code, message, details) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        return error;
    },
    
    createErrorResponse: function(message) {
        let errArr = [];
        errArr.push({type: 'error', message: message});
        return errArr;
    },
    
    isValid: function(data) {
        var valid = true;
        
        if (data === undefined) return valid;
        
        for (var i=0; i<data.length; i++) {
            if (data[i].type === 'error') {
                valid = false;
                break;
            }
        }
        
        return valid;
    }
    
}

module.exports = errorHandler;