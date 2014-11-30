/*jslint node: true */
/* jshint -W098 */
/**
* @module dbHelpers
*/
var sequelize = require('./db').sequelize;
var Vendor = require('./db').Vendor;
var User = require('./db').User;
var Rating = require('./db').Rating;
var Vendor = require('./db').Vendor;
var Pedestrian = require('./db').Pedestrian;
var Tip = require('./db').Tip;


/**
* Finds a user in the database based on username or email.
* @function findUser
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.findUser = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(callback);
};

/**
* Finds a user in the database based on username or email and returns all data (vendor + personal).
* @function getPersonal
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.getPersonal = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email }),
    include: {
      model: Vendor,
      include: Tip
    }
  }).then(callback);
};
/**
* Finds a vendor in the database based on username or email and returns all data on vendor.
* @function findVendor
* @memberof module:dbHelpers
* @instance
* @param {object} vendor Object containing vendor searching parameters.
* @param {string} vendor.username (Optional if searching by email) Username of the vendor your searching for.
* @param {string} vendor.email (Optional if searching by username) Email of the vendor your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.findVendor = function(vendor, callback) {
  var user = {
    username: vendor.username,
    email: vendor.email || vendor.username
  };
  exports.findUser(user, function(user) {
    Vendor.find({
      where: { UserId: user.id },
      include: User
    }).then(callback);
  });
};

/**
* Finds a vendor in the database based on username or email and returns public data.
* @function findOne
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.findOne = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email }),
    attributes: [
      'username',
      'displayname'
    ],
    include: {
      model: Vendor, 
      attributes: [
        'image',
        'description',
        'status',
        'latitude',
        'longitude',
        'createdAt',
        'category'
      ]
    }
  }).then(callback);
};

/**
* Finds all vendors in the database.
* @function findAll
* @memberof module:dbHelpers
* @instance
* @param {function} callback Function to be executed on results of the query. 
*/

exports.findAll = function(callback) {
  Vendor.findAll({
    attributes: [
      'id',
      'image',
      'description',
      'status',
      'latitude',
      'longitude',
      'createdAt',
      'category'
    ],
    include: [
      {
        model: User,
        attributes: [
          'username',
          'displayname',
        ]
      },
      Rating
    ]
  }).then(function(vendors) {
    vendors = vendors.map(function(val, index) {
      val.dataValues.avgrating = val.Ratings.reduce(function(mem, val, i, col) {
        mem += val.rating;
        if (i === col.length - 1) {
          mem /= col.length;
        }
        return mem;
      }, 0);
      return val;
    });
    callback(vendors)
  });
};

exports.findAllByType = function(params, callback) {
  Vendor.findAll({
    attributes: [
      'image',
      'description',
      'status',
      'latitude',
      'longitude',
      'createdAt',
      'category'
    ],
    where: {
      category: params.category
    },
    include: [
      {
        model: User,
        attributes: [
          'username',
          'displayname',
        ]
      },
      Rating
    ]
  }).then(function(vendors) {
    vendors = vendors.map(function(val, index) {
      val.dataValues.avgrating = val.Ratings.reduce(function(mem, val, i, col) {
        mem += val.rating;
        if (i === col.length - 1) {
          mem /= col.length;
        }
        return mem;
      }, 0);
      return val;
    });
    callback(vendors)
  });
};

//Return all Vendors within X miles of User.  Applies callback to an array of VendorIds. 
var vendorsNearUsers = function(UserId, miles, callback) {
  //translate miles to meters
  var radius = miles*1.6*1000;
  sequelize.query("SELECT ST_GeographyFromText('POINT(' || longitude || ' ' || latitude ||')')" + ' FROM "Users" WHERE id=' + UserId)
  .success(function(UserGeo) {
    var UserGeo = UserGeo[0].st_geographyfromtext;
    sequelize.query('SELECT id FROM "Vendors" WHERE ' + "ST_DWithin(ST_GeographyFromText('POINT(' || longitude || ' ' || latitude ||')'), " + "'" + UserGeo + "'" + ', ' + radius + ')')
    .success(function(VendorIds) {
      var nearbyVendors = [];
      for (var i=0; i < VendorIds.length; i++) {
        nearbyVendors.push(VendorIds[i].id);
      }
      // console.log('Nearby Vendors: ', nearbyVendors);
      if (callback) {
        callback(nearbyVendors);
      }
    });
  });
};

//Calculate Distance between User and Vendor. Applies callback to distance (in miles).
exports.calcDistance = function(UserId, VendorId, callback) {
  var qstring = 'WITH userlon AS (SELECT longitude FROM "Users" WHERE id='+UserId+'), userlat AS (SELECT latitude FROM "Users" WHERE id='+UserId+'), vendorlon AS (SELECT longitude FROM "Vendors" WHERE id='+VendorId+'), vendorlat AS (SELECT latitude FROM "Vendors" WHERE id='+VendorId+') SELECT ST_Distance(ST_GeographyFromText(' + "'POINT(' || userlon.longitude || ' ' || userlat.latitude ||')'), ST_GeographyFromText('POINT(' || vendorlon.longitude || ' ' || vendorlat.latitude ||')')) FROM userlon, userlat, vendorlon, vendorlat";
  sequelize.query(qstring)
  .success(function(distance) {
    // console.log('User distance from Vendor in Meters: ', distance[0].st_distance)
    var distance = Number(distance[0].st_distance) * 0.00062137;
    // console.log('User distance from Vendor in Miles: ', distance);
    if (callback) {
      callback(distance);
    }
  })
}





var addUser = function(username, password, email, latitude, longitude, zipcode, age, displayname, firstname, middlename, lastname) {
  //username, password and e-mail are required arguments
  var newUser = {
    username: username,
    password: password,
    email: email,
    latitude: latitude || null,
    longitude: longitude || null,
    zipcode: zipcode || null,
    age: age || null,
    displayname: displayname || null,
    firstname: firstname || null,
    middlename: middlename || null,
    lastname: lastname || null
  };

  User.create(newUser);
};


var addVendor = function(UserId, latitude, longitude, totaltip, image, description, status) {
  //UserId, Latitude and Longitude are required
  var newVendor = {
    UserId: UserId,
    latitude: latitude,
    longitude: longitude,
    image: image || null,
    description: description || null,
    status: status || false,
    totaltip: totaltip || null
  };

  Vendor.create(newVendor);
};

exports.getAllPeds = function(callback) {
  Pedestrian.findAll()
  .success(function(result) {
    callback(result);
  })
}

//Seed Data for Testing PostGIS Functions
// setTimeout(addUser.bind(this, 'test', 'test', 'test', 43.645016, -79.39092), 5000);
// setTimeout(addUser.bind(this, 'test', 'test', 'test', 43.666503, -79.381121), 5000);
// setTimeout(addVendor.bind(this, 2, 43.666503, -79.381121), 10000);
// // setTimeout(calcDistance.bind(this, 1, 1), 15000);
// setTimeout(vendorsNearUsers.bind(this,2,2), 15000);
