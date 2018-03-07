var utils = require('../utilityFunctions.js');
var downlink = require('../downlinkHandler.js');

var updateIndex = 1;

var sendNextUpdatePacket = function(){
    console.log("Pinging node...");
    var postData = utils.padWithZeros(updateIndex.toString(), 10);
    console.log("!!: " + postData)

    downlink.sendDownlink('2', postData);

    updateIndex++;
}


exports.handlePacketRequest = function (payload)
{
    sendNextUpdatePacket();

}