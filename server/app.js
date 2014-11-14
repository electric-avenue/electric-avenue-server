/*jslint node: true */
/* jshint -W098 */
var express = require('express');
var apiRouter = require('./routes').apiRouter;
var authRouter = require('./routes').authRouter;
var managementRouter = require('./routes').managementRouter;
var db = require('./db/db');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var port = require('./config/config').port;
var app = express();
var seed = require('./db/seed');
var subdomain = require('express-subdomain');
var seedPedestrian = require('./db/seed/pedestrian/seedPedestrian');

/*
* DEVELOPMENT ONLY - NOT NEEDED FOR IONIC BUILD
*/
var defaultCorsHeaders = {
  'access-control-allow-origin': 'http://localhost:8100',
  'access-control-allow-credentials': true,
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10
};

app.use(function(req, res, next) {
  res.header(defaultCorsHeaders);
  next();
});
/*
* END DEVELOPMENT ONLY 
*/
app.use(cookieParser());
app.use(session({ secret: 'TIPZIPWILLWIN' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(__dirname + '/../public'));
/*
* DEVELOPMENT ONLY - NOT NEEDED FOR IONIC BUILD
*/
var authenticate = function(req, res, next) {
  if (!req.isAuthenticated()) {
    console.log('authenticated:', req.isAuthenticated());
    console.log('user:', req.user);
    res.sendStatus(401);
  } else {
    console.log('authenticated:', req.isAuthenticated());
    console.log('user:', req.user);
    next();
  }
};
app.get('/test', authenticate, function(req, res) {
  console.log('For Testing:', req.user);
  res.json({result: true, user: req.user});
});
/*
* END DEVELOPMENT ONLY 
*/

var apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRouter(apiRoutes);

var authRoutes = express.Router();
app.use('/auth', authRoutes);
authRouter(authRoutes);

var managementRoutes = express.Router();
app.use(subdomain('management', managementRoutes));
managementRouter(managementRoutes);

console.log('Listening on Port:', port);
app.listen(port);