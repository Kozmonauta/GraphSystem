'use strict';

module.exports = function(app) {

  var controller = require('../controllers/eventController');

  app.route('/events')
    .post(controller.perform);

};
