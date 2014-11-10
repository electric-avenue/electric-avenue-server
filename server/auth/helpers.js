/*jslint node: true */
/**
* @module authHelpers
*/
var sequelize = require('../db/db').sequelize;
var User = require('../db/db').User;
var bcrypt = require('bcrypt');
var BPromise = require('bluebird');

/**
* Finds a user in the database based on username or email;
* @function findUser
* @memberof module:authHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Callback function to be executed on result of query. 
*/
exports.findUser = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(callback);
};

/**
* Checks to see if a password given by a user matches their Encrypted password stored in DB.
* @function checkPassword
* @memberof module:authHelpers
* @instance
* @param {object} user User object profile to test against.
* @param {string} user.password Password from user object profile.
* @param {string} password Password to test against provided by user.
*/
exports.checkPassword = function(user, password) {

  return new BPromise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        console.log('bcrypt compare error:', err);
      }
      resolve(result);
    });
  });
};

/**
* Generates a new user and stores in DB
* @function generateUser
* @memberof module:authHelpers
* @instance
* @param {object} user User object profile to save to database.
* @param {string} user.username Username of new user.
* @param {string} user.email Email of new user.
* @param {string} user.password Password of new user. Will be hashed before storage.
*/
exports.generateUser = function(user) {
  return new BPromise(function(resolve) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      User.build({
        username: user.username,
        email: user.email,
        password: hash
      })
      .save()
      .complete(function(err) {
        resolve(err);
      });
    });
  });
};