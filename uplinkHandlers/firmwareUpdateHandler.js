var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');
var fs = require("fs");

var updateIndex = 1;

var fwDeltaPath = "./deltas/delta500Bytes.txt";
var fwDeltaFile = fs.openSync(fwDeltaPath, "r");

var flag;


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

    var deltaBuffer = new Buffer(92);

    var bytesRead = fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (index - 1)*deltaBuffer.length);

    console.log("BYTES READ: " + bytesRead);
    if (bytesRead < deltaBuffer.length)
    {
        flag = 1;
    }
    else
    {
        flag = 0;
        updateIndex++;
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