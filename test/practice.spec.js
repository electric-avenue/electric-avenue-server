var app = require('../server/app.js');
console.log(app);
describe("App Test", function(){
  it('should be defined', function(){
    console.log("hi");
    expect(app).toBeDefined();
  })
});