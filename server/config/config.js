/*jslint node: true */
module.exports = {
  port: process.env.PORT || 5000,
  database: 'tipzip', 
  username: 'postgres', 
  password: 'myPassword',
  host: process.env.DATABASE_URL ||'localhost',
  db_port: 5432,
  dialect: 'postgres', //obviously you don't have to use PostgreSQL
  native: true};