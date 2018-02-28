require('colors');
var downlink = require('../sendDownlink.js');
var utils = require('../utilityFunctions.js');



var pingNode = function(nodeMessage){
    console.log("Pinging node...");
    var postData = new Buffer(nodeMessage + nodeMessage, 'hex').toString('base64');

    downlink.sendDownlink(postData);
}

exports.handleSensorReading = function (data, ack) {
    var readings = data.split("1E");
    readings = {"temp": readings[0], "humidity": readings[1], "water_level": readings[2]};
    console.log("SENSOR READINGS: ".blue);
    utils.logJSONObject(readings, 'green');

    if(ack){
        setTimeout(function(){
            pingNode(data);
        }, 1000);
    }
}