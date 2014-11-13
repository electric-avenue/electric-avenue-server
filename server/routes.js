/*jslint node: true */
/* jshint -W098 */
var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');
var multipart = require('connect-multiparty');
var express = require('express');

var authenticate = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  } else {
    next();
  }
};

var upload = multipart({
  uploadDir: __dirname + '/../public/'
});

exports.apiRouter = function(app) {
  app.post('/vendor/photo', authenticate, upload, api.photo)
  app.post('/vendor/add', authenticate, api.add);
  app.post('/vendor/update', authenticate, api.updateVendor);
  app.get('/vendor/status', authenticate, api.status);
  app.get('/vendor/:vendor', authenticate, api.findOne);
  app.get('/vendor', authenticate, api.findAll);
  
  // app.post('/vendor/photo', upload, api.photo);
  // app.post('/vendor/add', api.add);
  // app.post('/vendor/update', api.updateVendor);
  // app.get('/vendor/status', api.status);
  // app.get('/vendor/:vendor', api.findOne);
  // app.get('/vendor', api.findAll);
};

exports.authRouter = function(app) {
  app.post('/login', auth.login, function(req, res) {
    console.log('Logged In:', req.user, req.session);
    res.send(req.user);
  });
  app.post('/logout', auth.logout, function(req, res) {
    console.log('Logged Out:', req.user, req.session);
    res.sendStatus(401);
  });
  app.post('/register', auth.register);
};

exports.managementRouter = function(app) {
  var processData = require('./db/seed/seed').processData;
  app.use('/', express.static(__dirname + '/../management'));
  
  app.post('/populate', function(req, res) {
    processData(JSON.parse(req.body.type), JSON.parse(req.body.result)); 
    res.json({success: true, result: JSON.parse(req.body.type)});
  });
};