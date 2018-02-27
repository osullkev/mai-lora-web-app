var downlinkFrameCount = 1;

var updateDownlinkFrameCount = function (i) {
    downlinkFrameCount = i + 1;
    console.log("Updating downlink frame count ... ");

}

exports.updateNodeInfo = function(data){
    if (data.dl_fcnt) updateDownlinkFrameCount(data.dl_fcnt);
}

exports.getdownlinkFrameCount = function(){
    return downlinkFrameCount;
}