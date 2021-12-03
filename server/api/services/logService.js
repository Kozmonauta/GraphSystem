'use strict';

var logService = {
    
    log: function(s, options) {
        if (options === undefined) options = {};
        var t;
        
        switch (options.type) {
            case 'title':
                t = '\n■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■\n';
                t = utils.replaceAt(t, 6, ' ' + s + ' ');
                break;
            case 'function':
                t = '\n■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■\n';
                t = utils.replaceAt(t, 6, ' [ ' + s + ' ] ');
                break;
            case 'controllerFunction':
                t = '\n■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■\n';
                t = utils.replaceAt(t, 6, ' [ ' + s + ' ] ');
                t = '\n■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■' + t;
                t += '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■\n';
                break;
            default:
                t = s;
        }
        
        if (options.name !== undefined) {
            console.log('■ ' + options.name + ':', t);
        } else {
            console.log(t);
        }
    }
    
};

module.exports = logService;