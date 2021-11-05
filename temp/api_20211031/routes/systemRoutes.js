'use strict';

module.exports = function(app) {

    var controller = require('../controllers/systemController');

    app.route('/system')
        .post(controller.create)
    ;

    app.route('/system/clear')
        .post(controller.clear)
    ;

};