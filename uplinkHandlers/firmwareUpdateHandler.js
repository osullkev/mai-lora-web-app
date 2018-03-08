var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');

var updateIndex = 1;

var sendNextUpdatePacket = function(){
    console.log("Sending next firmware update packet...");
    var postData = utils.padWithZeros(updateIndex.toString(), 10);
    downlink.sendDownlink('5', postData);

    updateIndex++;
}


exports.handlePacketRequest = function (payload)
{
    sendNextUpdatePacket();

}