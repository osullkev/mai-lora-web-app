require('colors');
var downlink = require('../downlinkHandler.js');
var utils = require('../utilityFunctions.js');


var assembleFWJSON = function (fwversion) {
    var major = fwversion.substring(0, 2);
    var minor = fwversion.substring(2, 4);
    var patch = fwversion.substring(4);
    var fwStr = major + "." + minor + "." + patch;
    return {'major': major, 'minor': minor, 'patch': patch, 'fw_num': fwversion,'fw_string': fwStr};
}

var retrieveLatestFW = function () {
    return assembleFWJSON("010507");
}

var prepareFWUpdateDelta = function (currentFW, newFW) {
    console.log("Preparing update delta: ".yellow + currentFW.fw_string + " -> ".yellow + newFW.fw_string);
    console.log("...".yellow);
    return {'fw_num': newFW.fw_num, 'num_tx_packets': '0250', 'CRC': '1234ABCD'};
}

var sendUpdateAvailableNotification = function (currentFW, latestFW) {
    console.log("NEW FIRMWARE AVAILABLE: ".red + latestFW.fw_string);
    var deltaDetails = prepareFWUpdateDelta(currentFW, latestFW);
    var postData = deltaDetails.fw_num + "1E" + deltaDetails.num_tx_packets + "1E" + deltaDetails.CRC;
    downlink.sendDownlink('4', postData);
}

var checkBatteryLife = function (statusJSON) {
    if (statusJSON.battery_life < 10){
        console.log("NODE BATTERY IS LOW. REPLACE BATTERY: ".red + statusJSON.battery_life +"%");
    }else{
        console.log("NODE BATTERY IS STABLE: ".yellow + statusJSON.battery_life +"%");
    }

}

var sendUpdateAcknowledgeNotification = function (currentFW, latestFW) {
    var postData = ""; //Empty, no action required.
    downlink.sendDownlink('3', "");
}

var checkFWVersion = function (statusJSON) {
    var currentFWJSON = assembleFWJSON(statusJSON.fw_version);
    var latestFW = retrieveLatestFW();
    if (latestFW.major > currentFWJSON.major){
        sendUpdateAvailableNotification(currentFWJSON, latestFW);
    }else if (latestFW.minor > currentFWJSON.minor){
        sendUpdateAvailableNotification(currentFWJSON, latestFW);
    }else if (latestFW.patch > currentFWJSON.patch){
        sendUpdateAvailableNotification(currentFWJSON, latestFW);
    }else {
        console.log("FIRMWARE VERSION IS UP-TO-DATE: ".yellow + currentFWJSON.fw_string);
        sendUpdateAcknowledgeNotification(currentFWJSON, latestFW);
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