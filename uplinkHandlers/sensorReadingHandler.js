require('colors');
var downlink = require('../sendDownlink.js');


var pingNode = function(nodeMessage){
    console.log("Pinging node...");
    var postData = new Buffer(nodeMessage + nodeMessage, 'hex').toString('base64');

    downlink.sendDownlink(postData);
}

exports.handleSensorReading = function (data, ack) {
    var temp, humidity, water_level;
    readings = data.split("1E");

    [temp, humidity, water_level] = readings;
    console.log("READINGS: ".blue + readings);
    console.log("TEMP: ".blue + temp);
    console.log("HUMIDITY: ".blue + humidity);
    console.log("WATER LEVEL: ".blue + water_level);

    if(ack){
        setTimeout(function(){
            pingNode(data);
        }, 1000);
    }
}