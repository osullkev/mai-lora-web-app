require('colors');
var downlink = require('../downlinkHandler.js');
var utils = require('../utilityFunctions.js');
var fw = require('./firmwareUpdateHandler.js');

var sendUpdateAvailableNotification = function (currentFW, latestFW) {
    console.log("NEW FIRMWARE AVAILABLE: ".red + latestFW.fw_string);
    var deltaDetails = fw.prepareFWUpdateDelta(currentFW, latestFW);
    var postData = deltaDetails.fw_num + deltaDetails.num_tx_packets + deltaDetails.CRC;
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
    var currentFWJSON = fw.assembleFWJSON(statusJSON.fw_version);
    var latestFW = fw.assembleFWJSON(fw.retrieveLatestFW());
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
    var fwVer = data.substring(0,6);
    var batteryLife = data.substring(6);
    status = {"fw_version": fwVer, "battery_life": batteryLife};
    console.log("NODE STATUS: ".blue);
    utils.logJSONObject(status, 'green');

    checkBatteryLife(status);
    checkFWVersion(status);
}