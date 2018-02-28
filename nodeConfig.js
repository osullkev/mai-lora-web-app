var utils = require('./utilityFunctions.js');

var downlinkFrameCount = 1;
var downlinkSeqNumber = 1;

var updateDownlinkFrameCount = function (i) {
    console.log("Updating downlink frame count ... ");
        downlinkFrameCount = i + 1;
}

exports.incrementDownlinkFrameCount = function () {
    console.log("Incrementing downlink frame count ... ");
    downlinkFrameCount++;
}

exports.updateNodeInfo = function(data){
    if (data.dl_fcnt) updateDownlinkFrameCount(data.dl_fcnt);
}

exports.getdownlinkFrameCount = function(){
    return downlinkFrameCount;
}

exports.getDownlinkSeqNumber = function (){
    return utils.padWithZeros(downlinkSeqNumber.toString(16), 4);
}

exports.incrementDownlinkSeqNumber = function (){
    downlinkSeqNumber++;
}