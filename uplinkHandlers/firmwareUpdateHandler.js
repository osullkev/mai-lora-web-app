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
var bufferSize = 92;
var numOfPackets = Math.ceil(newFWDeltaSize*2 / bufferSize);


var missingPackets = [];
var currentMissingPacketIndex = 0;
var numberOfMissingPackets;
var recoveryStage = false;


var assembleUpdatePacket = function (flag, update)
{
    return flag.toString() + update;
}

var getFlag = function ()
{
    return flag;
}

var getUpdatePacket = function ()
{
    var deltaBuffer = new Buffer(bufferSize);

    var currentIndex = updateIndex;

    var bytesRead = fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (currentIndex - 1)*deltaBuffer.length);

    console.log("BYTES READ: " + bytesRead);
    if (currentIndex < numOfPackets)
    {
        flag = 0;
        updateIndex++;
    }
    else
    {
        flag = 1;
    }

    return utils.padWithZeros(currentIndex.toString(16), 3) + deltaBuffer.toString();
}

var getMissingUpdatePacket = function ()
{
    var deltaBuffer = new Buffer(bufferSize);

    var missingIndex = missingPackets[currentMissingPacketIndex];

    var bytesRead = fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (missingIndex - 1)*deltaBuffer.length);

    if (currentMissingPacketIndex < numberOfMissingPackets - 1)
    {
        flag = 0;
        currentMissingPacketIndex++;
    }
    else
    {
        flag = 1;
    }

    return utils.padWithZeros(missingIndex.toString(16), 3) + deltaBuffer.toString();
}

var sendNextUpdatePacket = function(){
    var updatePacket;

    if (recoveryStage)
    {
        console.log("Sending next missing firmware update packet...");
        updatePacket = getMissingUpdatePacket();
    }
    else
    {
        console.log("Sending next sequential firmware update packet...");
        updatePacket = getUpdatePacket();
    }

    var flag = getFlag();

    var postData = assembleUpdatePacket(flag, updatePacket);

    downlink.sendDownlink('5', postData);

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
        missingPackets = [];
        currentMissingPacketIndex = 0;
        numberOfMissingPackets = payload.length / 4;
        for  (var i = 0; i < numberOfMissingPackets; i++)
        {
            missingPackets[i] = parseInt(payload.substr(i*4, 4), 16);
        }
        console.log("Missing Packets: " + missingPackets);
        recoveryStage = true;
    }
        sendNextUpdatePacket();
}
