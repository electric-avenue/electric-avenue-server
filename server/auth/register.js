/*jslint node: true */
/* jshint -W098 */

var sequelize = require('../db/db').sequelize;
var helpers = require('./helpers');

module.exports = function(req, res) {
  var newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };
  helpers.findUser(newUser, function(user) {
    if (!!user) {
      return res.json({success: false, message: 'Error: Username already exists.'});
    } 

    helpers.generateUser(newUser).then(function(err) {
      req.login(newUser.username, function() {
        res.json({success: true, message: 'Successful Registration'});
      });
    });
  });
};