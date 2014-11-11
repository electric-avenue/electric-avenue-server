/*jslint node: true */
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var helpers = require('./helpers');

// module.exports = function(req, res, next) {
//   passport.authenticate('local', function(err, user) {
//     if (err) { console.log('Passport Error:', err); }

//     if (user) {
//       res.redirect('/');
//       // res.json({success: true, message: 'Login Successful!'});
//     } else {
//       // res.json({success: false, message: 'Error: Invalid Username/Password!'});
//     }
//   })(req, res, next);
// };
exports.login = passport.authenticate('local');

exports.logout = function(req, res, next) {
  req.logout();
  next();
};

passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = { username: username };
    helpers.findUser(user, function(user) {
      if (!user) {
        return done(null, false, {message: 'Invalid Username.'});
      }
      helpers.checkPassword(user, password).then(function(result) {
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