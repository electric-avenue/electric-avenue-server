/*jslint node: true */
/* jshint -W098 */
/**
* @module auth_register
*/
var helpers = require('../db/helpers');
var User = require('../db/db').User;
var bcrypt = require('bcrypt');
var BPromise = require('bluebird');
var checkPassword = require('./login').checkPassword;

/**
* Generates a new user and stores in DB
* @function
* @memberof module:auth
* @instance
* @param {object} user User object profile to save to database.
* @param {string} user.username Username of new user.
* @param {string} user.email Email of new user.
* @param {string} user.password Password of new user. Will be hashed before storage.
*/
var generateUser = function(user) {
  return new BPromise(function(resolve) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      User.build({
        username: user.username,
        email: user.email,
        password: hash
      })
      .save()
      .then(function(err) {
        resolve(err);
      });
    });
  });
};

/**
* Generates a new user and stores in DB
* @function
* @memberof module:auth
* @instance
* @param {object} user User object profile to save to database.
* @param {string} user.username Username of new user.
* @param {string} user.email Email of new user.
* @param {object} password Password Object for User.
* @param {string} password.oldpw Old Password.
* @param {string} password.newpw New Password.
*/
var changePassword = function(user, password) {
  return new BPromise(function(resolve, reject) {
    helpers.getPersonal(user, function(user) {
      checkPassword(user, password.oldpw)
      .then(function(result) {
        if (result) {
          bcrypt.hash(password.newpw, 10, function(err, hash) {
            user.updateAttributes({password: hash})
            .then(resolve);
          });
        } else {
          reject(result);
        }
      });
    });
  });
};

exports.changePassword = function(req, res) {
  var user = {
    username: req.user,
    email: req.user
  };
  var password = {
    oldpw: req.body.oldPassword,
    newpw: req.body.newPassword
  };
  changePassword(user, password)
  .then(function() {
    console.log('Password Change Success!');
    res.json({success: true, result: 'Password Change Success'});
  })
  .catch(function(err) {
    console.log('Password Change Failure:', err);
    res.json({success: false, result: 'Invalid Password'});
  });
};

exports.register = function(req, res) {
  var newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };
  helpers.findUser(newUser, function(user) {
    if (user) {
      return res.json({success: false, result: 'Error: Username already exists.'});
    } 

    generateUser(newUser).then(function(err) {
      req.login(newUser.username, function() {
        res.json({success: true, result: 'Successful Registration'});
      });
    });
  });
};
