require('colors');
var downlink = require('../sendDownlink.js');
var utils = require('../utilityFunctions.js');

var retrieveLatestFW = function () {
    return {'major': 1, 'minor': 5, 'patch': 7};
}

var sendUpdateAvailabeNotification = function () {
    console.log("NEW FIRMWARE AVAILABLE".red);

}

var pingNode = function(nodeMessage){
    console.log("Pinging node...");
    var postData = new Buffer(nodeMessage + nodeMessage, 'hex').toString('base64');

    downlink.sendDownlink(postData);
}

var checkBatteryLife = function (statusJSON) {
    if (statusJSON.battery_life < 10){
        console.log("NODE BATTERY IS LOW.".red);
        console.log("NEW BATTERY REQUIRED.".red);
    }

}

var checkFWVersion = function (statusJSON) {
    var fwversion = statusJSON.fw_version;
    var major = fwversion.substring(0, 2);
    var minor = fwversion.substring(2, 4);
    var patch = fwversion.substring(4);

    var latestFW = retrieveLatestFW();
    if (latestFW.major > major){
        sendUpdateAvailabeNotification();
    }else if (latestFW.minor > minor){
        sendUpdateAvailabeNotification();
    }else if (latestFW.patch > patch){
        sendUpdateAvailabeNotification();
    }else {
        console.log("FIRMWARE VERSION ".red + major + "." + minor + "." + patch + "." +  " IS UP-TO-DATE".red);
    }
}



exports.handleNodeStatus = function (data) {
    var status = data.split("1E");
    status = {"fw_version": status[0], "battery_life": status[1]};
    console.log("NODE STATUS: ".blue);
    utils.logJSONObject(status, 'green');

    checkBatteryLife(status);
    checkFWVersion(status);
}