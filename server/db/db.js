/*
* jslint node: true 
*/
var Sequelize = require('sequelize');
var config = require('../config/config.js');

// UNCOMMENT TO LINE 19 FOR HEROKU PRODUCTION PG DATABASE
// if (process.env.HEROKU_POSTGRESQL_GRAY_URL) {
//   var match = process.env.HEROKU_POSTGRESQL_GRAY_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
// }  else {
//   var match = 'postgres://clqelihiewknzx:mPAumcBI-kQepasSXF-VkWcoQn@ec2-54-243-51-102.compute-1.amazonaws.com:5432/d1o7guvu2hnr2n'.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
// }

// var sequelize = new Sequelize(match[5], match[1], match[2], {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   port: match[4],
//   host: match[3],
//   logging: true,
//   native: true
// });

// UNCOMMENT TO LINE 39 FOR LOCAL PG DATABASE
var isNative = false;
var connectionString = config.dialect + '://' 
                     + config.username + ':' 
                     + config.password 
                     + '@' + config.host + ':5432/' 
                     + config.database;

if (process.env.NODE_ENV) {
  connection_string = process.env.DATABASE_URL;
  isNative = true;
}

var sequelize = new Sequelize(connectionString, {
  logging: console.log,
  logging: true,
  protocol: 'postgres',
  native: isNative
});

/*
* ==== DB SCHEMAS ====
*/ 
sequelize.authenticate()
.complete(function(err) {
  if (err) {
    console.log('Unable to connect to the database:', err);
    return;
  } 
  console.log('Connection has been established successfully.');
});

/*
* ==== USER MODEL ====
*/
var User = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  zipcode: Sequelize.FLOAT,
  age: Sequelize.INTEGER,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  displayname: Sequelize.STRING,
  firstname: Sequelize.STRING,
  middlename: Sequelize.STRING,
  lastname: Sequelize.STRING,
  stripe: Sequelize.STRING
});

/*
* ==== VENDOR MODEL ====
*/
var Vendor = sequelize.define('Vendor', {
  image: Sequelize.STRING,
  description: {
    type: Sequelize.STRING,
    defaultValue: 'Enter a description'
  },
  status: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  totaltip: Sequelize.DECIMAL,
  latitude: {
    type: Sequelize.FLOAT,
    defaultValue: 43.645016
  },
  longitude: {
    type: Sequelize.FLOAT,
    defaultValue: -79.39092
  },
  category: {
    type: Sequelize.STRING,
    defaultValue: "Food"
  }
});

User.hasOne(Vendor);
Vendor.belongsTo(User);

User.hasMany(Vendor);
Vendor.hasMany(User);

/*
* ==== TIP MODEL ==== 
*/
var Tip = sequelize.define('Tip', {
  amount: Sequelize.DECIMAL,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  paid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

User.hasMany(Tip);
Tip.belongsTo(User);
Vendor.hasMany(Tip);
Tip.belongsTo(Vendor);

/* 
* ==== RATING MODEL ====
*/
var Rating = sequelize.define('Rating', {
  rating: Sequelize.INTEGER,
  review: Sequelize.TEXT
});

Vendor.hasMany(Rating);
Rating.belongsTo(Vendor);
User.hasMany(Rating);
Rating.belongsTo(User);


/*
* ==== PEDESTRIAN MODEL ==== 
*/ 
var Pedestrian = sequelize.define('pedestrianvolume',{
  mainroute: Sequelize.STRING,
  sideroute: Sequelize.STRING,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  pedestrianvol8hr: Sequelize.STRING,
  pedestrianvol24hr: Sequelize.STRING
});

/* 
* Synchronize the schema and create tables
* "force: true" removes existing tables and re-create them
*/
sequelize.sync({ force: false })
.complete(function(err) {
   if (err) {
     console.log('An error occurred while creating the table:', err);
     return;
   } 
   console.log('It worked!');
});

/*
* Clean Up Ratings Table By Removing Duplicate Reviews (Caused by Data Seeding)
*/
sequelize.query('DELETE FROM "Ratings" WHERE id NOT IN (SELECT MIN(id) FROM "Ratings" GROUP BY "UserId", "VendorId")').success(function(result) {
  console.log('Duplicate Reviews Deleted!');
});

/*
* ==== EXPORTS ====
*/ 
module.exports = {
  sequelize: sequelize,
  User: User,
  Vendor: Vendor, 
  Tip: Tip,
  Rating: Rating,
  Pedestrian: Pedestrian
};