/*jslint node: true */
/* jshint -W098 */

var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');

var authenticate = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  } else {
    next();
  }
};

// exports.authentication = function(app) {
//  app.get('/loggedin', function(req, res) {
//   res.send(req.isAuthenticated() ? req.user : '0');
//  });
// }
exports.apiRouter = function(app) {
  app.post('/vendor/add', authenticate, api.add);
  app.post('/vendor/update', authenticate, api.update);
  app.get('/vendors', authenticate, api.getAll);
  app.get('/vendor/:vendor', authenticate, api.getOne);
};

exports.authRouter = function(app) {
  app.post('/login', auth.login, function(req, res) {
    console.log('Logged In:', req.user, req.session);
    res.send(req.user);
  });
  app.post('/logout', auth.logout, function(req, res) {
    console.log('Logged Out:', req.user, req.session);
    // res.send('Logout Successful');
    res.sendStatus(401);
  })
  app.post('/register', function(req, res, next) {
    console.log('hiiiiii');
    next();
  }, auth.register);
};