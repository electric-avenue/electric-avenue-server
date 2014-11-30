/*jslint node: true */
/* jshint -W098 */
var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');
var multipart = require('connect-multiparty');
var express = require('express');
var payments = require('./payments/payments');
var config = require('./config/config');

var authenticate = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  } 
  next();
};

var upload = multipart({
  uploadDir: __dirname + '/..' + config.images
});

/* ======= ROUTER: '/api' ======= */
exports.api = function(app) {
  app.post('/vendor/photo', authenticate, upload, api.uploadPhoto)
  app.post('/vendor/add', authenticate, api.addVendor);
  app.post('/vendor/update', authenticate, api.updateVendor);
  app.post('/vendor/rate', authenticate, api.addRating);
  app.post('/vendor/get', authenticate, api.getAll);
  app.get('/vendor/info', authenticate, api.info);
  app.get('/vendor/:vendor', authenticate, api.getOne);
  app.get('/vendor/:vendor/status', authenticate, api.getStatus);

  app.post('/user/update', authenticate, api.updateUser);
  app.post('/user/calcDistance', authenticate, api.getDistance);
  app.get('/user/personal', authenticate, api.getPersonal);

  app.get('/peds', authenticate, api.getAllPeds);
};

/* ======= ROUTER: '/auth' ======= */
exports.auth = function(app) {
  app.post('/login', auth.login, auth.isVendor, function(req, res) {
    if (!req.user) { 
      res.json({user: null}); 
      return; 
    }
    console.log('Logged In:', req.user, req.session, 'type:', req.isVendor);
    res.json({user: req.user, isVendor: req.isVendor, isOnline: req.isOnline});
  });
  app.post('/logout', auth.logout, function(req, res) {
    console.log('Logged Out:', req.user, req.session);
    res.sendStatus(401);
  });
  app.post('/register', auth.register);
};

/* ======= subdomain: 'management' ======= */
exports.management = function(app) {
  var processData = require('./db/seed/populateDB').processData;
  app.use('/', express.static(__dirname + '/../management'));

  app.post('/populate', function(req, res) {
    processData(JSON.parse(req.body.type), JSON.parse(req.body.result)); 
    res.json({
      success: true, 
      result: JSON.parse(req.body.type)
    });
  });
};

exports.payments = function(app) {
  app.post('/save', authenticate, payments.saveCard);
  app.post('/listcards', authenticate, payments.getCards);
  app.post('/setdefault', authenticate, payments.setDefault);
  app.post('/tip', authenticate, payments.sendTip);
};