var rest = require('./doRest.js');
var orbiwiseConfig = require('./orbiwise-config.js');
var nodeConfig = require('./nodeConfig.js');


exports.sendDownlink = function (postData) {
    var dlFcnt = nodeConfig.getdownlinkFrameCount();
    rest.doRest("POST", "/rest/nodes/0004a30b001b0af1/payloads/dl?fcnt="+dlFcnt+"&port=01&confirmed=false", postData, function (status, m) {

    }, orbiwiseConfig.config());
    nodeConfig.incrementDownlinkFrameCount();
}