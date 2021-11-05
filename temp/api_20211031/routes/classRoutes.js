'use strict';

module.exports = function(app) {

    var controller = require('../controllers/classController');

    app.route('/classes')
        .post(controller.create)
        .get(controller.find)
    ;

    app.route('/classes/:id')
        .get(controller.get)
        .put(controller.update)
        .delete(controller.delete)
    ;

    app.route('/delete-classes')
        .post(controller.deleteMass)
    ;
    
};