var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');
var fs = require("fs");

var updateIndex = 1;

var fwDeltaPath = "./deltas/delta500Bytes.txt";
var fwDeltaFile = fs.openSync(fwDeltaPath, "r");
var deltaBuffer = new Buffer(100);


var assembleUpdatePacket = function (flag, index, update)
{
    return flag.toString() + utils.padWithZeros(index.toString(16), 3) + update;
}

var getFlag = function ()
{
    if (updateIndex < 10)
    {
        return 0; // More packets available
    }
    else
    {
        return 1; // Last packet
    }
}

var getUpdatePacket = function (index)
{
    if (!index)
    {
        index = updateIndex;
    }

    fs.readSync(fwDeltaFile, deltaBuffer, 0, deltaBuffer.length, (index - 1)*deltaBuffer.length);

    return deltaBuffer.toString();
}

var sendNextUpdatePacket = function(){
    console.log("Sending next firmware update packet...");
    var updatePacket = getUpdatePacket();

    var flag = getFlag();

    var postData = assembleUpdatePacket(flag, updateIndex, updatePacket);

    downlink.sendDownlink('5', postData);

    updateIndex++;
}


exports.handlePacketRequest = function (payload)
{
    sendNextUpdatePacket();
}