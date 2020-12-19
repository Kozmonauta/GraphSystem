'use strict';

module.exports = function(app) {

  var controller = require('../controllers/userController');

  app.route('/userinfo')
    .get(controller.getUserInfo)
  ;

  app.route('/login')
    .post(controller.login)
  ;

  app.route('/activate-account/:token')
    .post(controller.activateAccount)
  ;

};
