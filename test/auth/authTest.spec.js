/*jslint node: true */

var sequelize = require('../../server/db/db.js');
describe("Auth Test", function(){
  it('should be defined', function(){
    expect(sequelize).toBeDefined();
  });
});