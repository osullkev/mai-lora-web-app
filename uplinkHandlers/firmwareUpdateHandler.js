var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');
var fs = require("fs");

var updateIndex = 1;

var newFwDeltaPath = "./deltas/delta500Bytes.txt";
const stats = fs.statSync(newFwDeltaPath);
const newFWDeltaSize = stats.size / 2;
var newFwDeltaVersion = "010507";
var fwDeltaFile = fs.openSync(newFwDeltaPath, "r");

var flag = 0;
var bufferSize = 92;
var numOfPackets = Math.ceil(newFWDeltaSize*2 / bufferSize);


var missingPackets = [];
var currentMissingPacketIndex = 0;
var numberOfMissingPackets;
var recoveryStage = false;

var packetIndexStatus = [];

// Set each packet delivery status to false
for (var i = 0; i < numOfPackets; i++)
{
    packetIndexStatus[i] = false;
}

var acknowledgeIndexDelivery = function (index)
{
    console.log("Acknowledging delivery of update index: " + index);
    packetIndexStatus[index - 1] = true;

}

var getNextUndeliveredPacketIndex = function ()
{
    var i = 0;
    while (((updateIndex - 1) % numOfPackets) < numOfPackets)
    {
        console.log("Checking updateIndex: " + updateIndex);
        console.log("Checking real index: " + ((updateIndex - 1) % numOfPackets));

        if (packetIndexStatus[(updateIndex - 1) % numOfPackets] === false)
        {
            return ((updateIndex - 1) % numOfPackets) + 1;
        }
        else
        {
            i++;
            updateIndex++;
        }

        if (i >= numOfPackets)
        {
            console.log("All Packets Delivered")
            return -1;
        }
    }
}

var assembleUpdatePacket = function (flag, update)
{
    return flag.toString() + update;
}

var getFlag = function ()
{
    var numPacketsLeft = 0;
    for (var i = 0; i < numOfPackets; i++)
    {
        if (packetIndexStatus[i] === false)
        {
            numPacketsLeft++;
        }
    }
    if (numPacketsLeft === 1)
    {
        flag = 1;
    }
    else if (numPacketsLeft === 0)
    {
        flag = 3;
    }
    else
    {
        flag = 0;
    }
    return flag;
}

var getUpdatePacket = function ()
{
    var deltaBuffer = new Buffer(bufferSize);

    var currentIndex = getNextUndeliveredPacketIndex();

    if (currentIndex === -1)
    {
        return "000"; //Notify that all packets have been sent and delivered!
    }
    else
    {
        var bytesRead = fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (currentIndex - 1)*deltaBuffer.length);

        console.log("BYTES READ: " + bytesRead);

        updateIndex++;

        return utils.padWithZeros(currentIndex.toString(16), 3) + deltaBuffer.toString();
    }
}

var sendNextUpdatePacket = function(){
    var updatePacket;
    console.log("Sending next undelivered firmware update packet...");
    updatePacket = getUpdatePacket();

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
        var acknowledgedIndex = parseInt(payload);
        acknowledgeIndexDelivery(acknowledgedIndex);
    }
        sendNextUpdatePacket();
}
