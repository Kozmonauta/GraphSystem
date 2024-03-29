'use strict';

module.exports = function(app) {

    var controller = require('../controllers/objectController');

    // Async/await test
    // app.route('/await')
        // .get(controller.awaitTest)
    // ;

    app.route('/objects')
        // .get(controller.findByQuery)
        .post(controller.create)
    ;

    app.route('/object-edges')
        .get(controller.findByEdge)
    ;

    app.route('/objects/:id')
        .get(controller.get)
        .post(controller.update)
        // .patch(controller.patch)
        // .delete(controller.delete)
    ;
    
    app.route('/objects/import')
        // .post(controller.import)
    ;
    
    app.route('/object-list')
        // .post(controller.find)
    ;

};