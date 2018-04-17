var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');
var fs = require("fs");

var updateIndex = 1;

var newFwDeltaPath = "./deltas/delta500Bytes.txt";
const stats = fs.statSync(newFwDeltaPath);
const newFWDeltaSize = stats.size / 2;
var newFwDeltaVersion = "010507";
var fwDeltaFile = fs.openSync(newFwDeltaPath, "r");

var flag;
var bufferSize = 96;
var numOfPackets = Math.ceil(newFWDeltaSize*2 / bufferSize);


var missingPackets = [];
var currentMissingPacketIndex = 0;
var numberOfMissingPackets;
var recoveryStage = false;

var specificIndexRequest = false;
var specificIndex;
var opcode = 0;

var assembleUpdatePacket = function (update)
{
    return update;
}

var getFlag = function ()
{
    return flag;
}

var getUpdatePacketIndex = function ()
{
    var deltaBuffer = new Buffer(bufferSize);

    var currentIndex = specificIndex;

    var bytesRead = fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (currentIndex - 1)*deltaBuffer.length);

    console.log("BYTES READ: " + bytesRead);
    if (currentIndex == numOfPackets)
    {
        opcode = 1
    }
    else
    {
        opcode = 0;
    }

    return utils.padWithZeros(currentIndex.toString(16), 2) + deltaBuffer.toString();
}

var sendNextUpdatePacket = function(){
    var updatePacket;

    updatePacket = getUpdatePacketIndex();

    var postData = assembleUpdatePacket(updatePacket);

    downlink.sendDownlink('2', opcode, postData);

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
        'size': utils.padWithZeros(newFWDeltaSize.toString(), 4),
        'CRC': '1234ABCD'};
}


exports.handlePacketRequest = function (payload)
{
    if (payload) //Resend missing packets
    {
        specificIndexRequest = true;
        specificIndex = parseInt(payload, 16);

    }
        sendNextUpdatePacket();
}
