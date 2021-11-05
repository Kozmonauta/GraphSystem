'use strict';

exports.profile = function(req, res) {
    var profile = {
        name:'Joe Cocker',
        letter:'C',
        monogram:'JC',
        email:'joe@cocker.com'
    };
    res.json(profile);
};
