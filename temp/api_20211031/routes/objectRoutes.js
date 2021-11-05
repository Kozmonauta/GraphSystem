'use strict';

module.exports = function(app) {

    var controller = require('../controllers/objectController');

    // Async/await test
    // app.route('/await')
        // .get(controller.awaitTest)
    // ;

    app.route('/objects')
        .get(controller.findByQuery)
        .post(controller.create)
    ;

    app.route('/objects/:id')
        .get(controller.get)
        .put(controller.update)
        .patch(controller.updateFields)
        .delete(controller.delete)
    ;
    
    app.route('/objects/import')
        .post(controller.import)
    ;
    
    app.route('/object-list')
        .post(controller.find)
    ;

};