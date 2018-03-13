var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');
var fs = require("fs");

var updateIndex = 1;

var newFwDeltaPath = "./deltas/delta500Bytes.txt";
var newFWDeltaSize = 500;
var newFwDeltaVersion = "010507";
var fwDeltaFile = fs.openSync(newFwDeltaPath, "r");

var flag;

var bufferSize = 92;

var numOfPackets = Math.floor(newFWDeltaSize*2 / bufferSize) + 1;


var assembleUpdatePacket = function (flag, update)
{
    return flag.toString() + update;
}

var getFlag = function ()
{
    return flag;
}

var getUpdatePacket = function (index)
{
    if (!index)
    {
        index = updateIndex;
    }

    var deltaBuffer = new Buffer(bufferSize);

    var bytesRead = fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (index - 1)*deltaBuffer.length);

    console.log("BYTES READ: " + bytesRead);
    if (index < numOfPackets)
    {
        flag = 0;
        updateIndex++;
    }
    else
    {
        flag = 1;
    }

    return utils.padWithZeros(index.toString(16), 3) + deltaBuffer.toString();
}

var sendNextUpdatePacket = function(){
    console.log("Sending next firmware update packet...");
    var updatePacket = getUpdatePacket();

    var flag = getFlag();

    var postData = assembleUpdatePacket(flag, updatePacket);

    downlink.sendDownlink('5', postData);

}


exports.handlePacketRequest = function (payload)
{
    sendNextUpdatePacket();
}

exports.assembleFWJSON = function (fwversion) {
    var major = fwversion.substring(0, 2);
    var minor = fwversion.substring(2, 4);
    var patch = fwversion.substring(4);
    var fwStr = major + "." + minor + "." + patch;
    return {'major': major, 'minor': minor, 'patch': patch, 'fw_num': fwversion,'fw_string': fwStr};
}

exports.retrieveLatestFW = function()
{
    return newFwDeltaVersion;
}

exports.prepareFWUpdateDelta = function (currentFW, newFW) {
    console.log("Preparing update delta: ".red + currentFW.fw_string + " -> ".red + newFW.fw_string);
    console.log("...".red);
    return {'fw_num': newFW.fw_num,
        'num_tx_packets': utils.padWithZeros(numOfPackets.toString(16), 4),
        'CRC': '1234ABCD'};
}