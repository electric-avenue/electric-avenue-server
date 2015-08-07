/*jslint node: true */
/* jshint -W098 */
/**
* @module api
*/
var helpers = require('../db/helpers');
var recommendations = require('../db/recommendation');
var Vendor = require('../db/db').Vendor;
var User = require('../db/db').User
var Rating = require('../db/db').Rating;
var multipart = require('connect-multiparty');
var _ = require('lodash');


// need to handle being able to add a photo "before" user finishes registration process
/**
* Allows currently authenticated user to upload a photo to their vendor account 
* @function uploadPhoto
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.uploadPhoto = function (req, res) {
  var fileName = req.files.file.path.split('/');
  fileName = fileName[fileName.length - 1];

  var changes = {
    image: fileName
  };
  var vendor = {
    username: req.user,
    email: req.user
  };
  helpers.findVendor(vendor, function(vendor) {
    vendor.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: {
          imagePath: fileName
        }
      }); 
    });
  });
};

/**
* Allows currently authenticated user to upgrade their account to a Vendor account.
* @function addVendor
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.addVendor = function(req, res) {
  console.log('req body', req.body);
  helpers.findUser({username: req.user}, function(user) {
    Vendor.build({
      description: req.body.description,
      status: false,
      UserId: user.id,
      category: req.body.category
    })
    .save()
    .complete(function(err) {
      if (err) {
        console.log('Error:', err);
        res.json({
          success: false,
          result: 'Error: Vendor profile creation unsuccessful.',
          user: req.user,
          isVendor: false
        });
        return;
      }
      res.json({
        success: true,
        result: 'Vendor Successfully Created!',
        user: req.user,
        isVendor: true
      });
    });
  });
};

/**
* Allows a user (or vendor) to get the online status of single vendor, or themeselves.
* @function getStatus
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getStatus = function(req, res) {
  var user = {
    username: req.params.vendor || req.user
  };
  helpers.findOne(user, function(user) {
    res.json({
      success: true, 
      result: {
        isOnline: user.Vendor.status
      }
    });
  });
};

/**
* Allows a user (or vendor) to grab public information for a single vendor 
* @function getOne
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getOne = function(req, res) {
  var user = {
    username: req.params.vendor || req.user,
    email: req.params.vendor || req.user
  };
  helpers.findOne(user, function(vendor) {
    res.json({
      success: true, 
      result: vendor || []
    });
  });
};

/**
* Allows a user (or vendor) to grab public information for all vendors (Filter Constraints WIP)
* @function getAll
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getAll = function(req, res) {
  var params = _.pick(req.body, [
    'category'
  ]);
  helpers.findUser({username: req.user}, function(user) {
    if (params.category) {
      helpers.findAllByType(params, function(vendors) {
        res.json({
          success: true,
          result: vendors
        });
      }, user);
      return;
    }

    helpers.findAll(function(vendors) {
      res.json({
        success: true,
        result: vendors
      });
    }, user);
  });
};

/**
* Allows a user (or vendor) to grab all of their information
* @function getPersonal
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getPersonal = function(req, res) {
  var user = {
    username: req.user,
    email: req.user
  };
  helpers.getPersonal(user, function(vendor) {
    res.json({
      success: true, 
      result: vendor || []
    });
  });
};

/**
* Allows currently authenticated vendor to update their vendor account information
* @function updateVendor
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.updateVendor = function(req, res) {
  var changes = _.pick(req.body, [
    'description',
    'status',
    'category',
    'latitude',
    'longitude'
  ]);
  var vendor = {
    username: req.user, 
    email: req.user
  };
  helpers.findVendor(vendor, function(vendor) {
    vendor.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: vendor
      });
    });
  });
};

/**
* Allows currently authenticated user to update their user account information
* @function updateUser
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.updateUser = function(req, res) {
  var changes = _.pick(req.body, [
    'displayname',
    'firstname',
    'middlename',
    'lastname',
    'email',
    'zipcode',
    'age'
  ]);
  console.log(changes);
  var user = {
    username: req.user,
    email: req.user
  };

  helpers.findUser(user, function(user) {
    user.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: user
      });
    });
  });
};


exports.addRating = function(req, res) {
  helpers.getPersonal({username: req.user}, function(user) {
    helpers.findVendor({username:req.body.vendor}, function(vendor) {
      Rating.build({
        rating: req.body.rating,
        review: req.body.review,
        VendorId: vendor.id,
        UserId: user.id
      })
      .save()
      .complete(function(err) {
        if (err) {
          console.log('Rating Save Error:', err);
          res.json({success: false, result: 'Rating Save unsuccessful.'});
          return;
        }
        res.json({success: true, result: 'Vendor Save Successful'});
      });
    });
  });
};

exports.info = function(req, res) {
  helpers.getPersonal({username: req.user}, function(user) {
    res.json({success: true, result: 'Tip Info Received', data: user});
  });
};

exports.getAllPeds = function(req, res) {
  helpers.getAllPeds(function(results) {
    res.json({success:true, result: results});
    return;
  })
};

exports.getDistance = function(req,res){
  helpers.calcDistance(req.body.userID,req.body.vendorID,function(distance){
    res.json({success:true, result:"Distance info received", data: distance});
    return;
  });
}

exports.getRecommendations = function(req,res){
  recommendations.findRecommendation(req.body.userID,function(vendors){
    console.log(vendors," from get recos");
   //make a call to find all vendors with id
   if(vendors  === null){
     res.json({success:true, result: null, status: "Need to review more vendors."});
     return;
   }
   console.log('FIND THE VENDOR INFO')
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
      id: vendors
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
  }).success(function(vendorDetails){
      console.log(vendorDetails," IS VENDORDETAILS");
      console.log(vendorDetails.length)
      //may need to make call to grab user info from 
      res.json({success:true, result: vendorDetails, status: "Vendor details received."});
    }).catch(function(err){
      console.log("Error retrieving vendor details ",err);
    });
  });
};  
