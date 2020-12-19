'use strict';

module.exports = function(app) {
    
  var controller = require('../controllers/foldersController');

  // todoList Routes
  app.route('/folders')
    .post(controller.add)
    .get(controller.find);

  app.route('/folders/:id')
    .get(controller.get)
    .put(controller.update)
    .delete(controller.delete);
    
};