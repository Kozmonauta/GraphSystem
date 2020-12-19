'use strict';

module.exports = function(app) {
  
  var myController = require('../controllers/myController');

  app.route('/my/profile')
    .get(myController.profile);
    
};