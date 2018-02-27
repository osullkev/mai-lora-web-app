var downlinkFrameCount = 1;

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