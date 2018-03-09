var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');

var updateIndex = 1;

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

var sendNextUpdatePacket = function(){
    console.log("Sending next firmware update packet...");
    var updatePacket = utils.padWithZeros(updateIndex.toString(), 10);

    var flag = getFlag();

    var postData = assembleUpdatePacket(flag, updateIndex, updatePacket);

    downlink.sendDownlink('5', postData);

    updateIndex++;
}


exports.handlePacketRequest = function (payload)
{
    sendNextUpdatePacket();
}