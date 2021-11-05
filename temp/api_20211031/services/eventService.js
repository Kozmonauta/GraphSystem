'use strict';

exports.perform = function(condition) {
    switch (condition.type) {
        case 'email':
            console.log('sending email');
            break;
    }
};

exports.applyLogic = function(condition) {
    var r = true;
    console.log('applyLogic', condition);
    if (condition["=="] !== undefined) {
        var c = this.replaceValues(e.condition["=="], o);
        var v = c[0];
        if (c.length > 1) {
            for (var i=1;i<c.length;i++) {
                if (v !== c[i]) {
                    r = false;
                }
            }
        }
    }
    return r;
};

// {a:"$core.status", o:{core:{status:"active"}}} => "active"
exports.replaceValues = function(a,o) {
    for (var i=0;i<a.length;i++) {
        if (typeof a[i] === 'string') {
            if (a[i][0] === '$') {
                a[i] = a[i].substr(1);
                a[i] = this.getObjectValue(a[i], o);
            }
        }
    }
    return a;
};

exports.replaceParameters = function(params) {
    return params;
};

exports.getObjectValue = function(s,o) {
    var v;
    var sa = s.split('.');
    if (sa.length > 1) {
        v = o;
        for (var i=0;i<sa.length;i++) {
            v = v[sa[i]];
        }
    } else {
        v = s;
    }
    return v;
};
