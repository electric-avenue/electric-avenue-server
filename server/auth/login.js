/*jslint node: true */
/**
* @module auth_login
*/
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var helpers = require('../db/helpers');
var bcrypt = require('bcrypt');
var BPromise = require('bluebird');


exports.isVendor = function(req, res, next) {
  if (!req.user) {
    next();
    return;
  }
  var user = { username: req.user };
  helpers.findVendor(user, function(vendor) {
    if (vendor) {
      req.isVendor = true;
      req.isOnline = vendor.get('status');
      next();

      return;
    }
    req.isVendor = false;
    next();
  });
};
exports.login = passport.authenticate('local');
exports.logout = function(req, res, next) {
  req.logout();
  next();
};

/**
* Checks to see if a password given by a user matches their Encrypted password stored in DB.
* @function
* @memberof module:auth
* @instance
* @param {object} user User object profile to test against.
* @param {string} user.password Password from user object profile.
* @param {string} password Password to test against provided by user.
*/
var checkPassword = exports.checkPassword = function(user, password) {
  return new BPromise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        console.log('bcrypt compare error:', err);
      }
      resolve(result);
    });
  });
};

passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = { username: username };
    helpers.findUser(user, function(user) {
      if (!user) {
        return done(null, false, {message: 'Invalid Username.'});
      }
      checkPassword(user, password).then(function(result) {
        if (result) {
          return done(null, user.username);
        }
        return done(null, false, {messsage: 'Invalid Password.'});
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
