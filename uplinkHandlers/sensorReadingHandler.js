require('colors');
var downlink = require('../downlinkHandler.js');
var utils = require('../utilityFunctions.js');



var pingNode = function(nodeMessage){
    console.log("Pinging node...");
    var postData = nodeMessage;

    downlink.sendDownlink('2', postData);
}

exports.handleSensorReading = function (data, ack) {
    var readings = data.split("1E");
    readings = {"temp": readings[0], "humidity": readings[1], "water_level": readings[2]};
    console.log("SENSOR READINGS: ".blue);
    utils.logJSONObject(readings, 'green');

    if(ack){
        pingNode(data);
    }
}