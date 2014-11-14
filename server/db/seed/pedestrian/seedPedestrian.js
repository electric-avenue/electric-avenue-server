var xlsParser = require('xls-to-json');
var Pedestrian = require('../../db').Pedestrian;


/**
* Inserts ped volume for an intersection into the database.
* @function insertPedestrianVolume
* @memberof module:dbHelpers
* @instance
* @param {function} callback Function to be executed on results of the query. 
*/
var insertPedestrianVolume = exports.insertPedestrianVolume = function(pedVolumeObj){
  console.log("Seeding Pedestrian data");
  var xlsParserInput = {
      input: __dirname + "/signalizedTrafficPedestrianVolumes.xls",
      output: null
      //sheet: "sheetname",  // specific sheetnam
  };
  xlsParser(xlsParserInput,function(err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log("TRY AND INSERT DATA");
      console.log(result.length);
      for(var i=0; i<result.length;i++){
        Pedestrian.build({
          mainroute: result[i]['Main'],
          sideroute: result[i]['Side 1 Route'],
          latitude: result[i]['Latitude'],
          longitude: result[i]['Longitude'],
          pedestrianvol8hr: result[i]['8HrPedVol'],
          pedestrianvol24hr: result[i]['24HrPedVol']
        }).save()
        .complete(function(err){
          if (!!err){
            console.log(" PEDESTRIAN This instance hasn't been saved:", err);
          }else{
            console.log('PEDESTRIAN Instance has been stored.');
          }
        });
      }
    }
  });
};

setTimeout(insertPedestrianVolume, 20000);