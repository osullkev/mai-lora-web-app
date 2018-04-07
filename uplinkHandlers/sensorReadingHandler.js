require('colors');
var downlink = require('../downlinkHandler.js');
var utils = require('../utilityFunctions.js');



var pingNode = function(nodeMessage){
    console.log("Pinging node...");
    var postData = nodeMessage;

    downlink.sendDownlink('1', '0', postData);
}

exports.handleSensorReading = function (data, ack) {
    var temp = data.substring(0,2);
    var humidity = data.substring(2,4);
    var waterLevel = data.substring(4);
    var readings = {"temp": temp, "humidity": humidity, "water_level": waterLevel};
    console.log("SENSOR READINGS: ".blue);
    utils.logJSONObject(readings, 'green');

    if(ack){
        pingNode(data);
    }
}