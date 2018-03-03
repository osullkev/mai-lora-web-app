var rest = require('./doRest.js');
var orbiwiseConfig = require('./orbiwiseConfig.js');
var nodeConfig = require('./nodeConfig.js');
var utils = require('./utilityFunctions.js');
var logHandler = require('./loggingHandler.js');
require('colors');

var calculatePacketLen = function (postData) {
    // TODO: Implement function
    return '000';
}

var logPacket = function (opcode, seqNum, len, postData) {
    console.log("OPCODE: ".yellow + opcode);
    console.log("SEQ#:   ".yellow + seqNum);
    console.log("LENGTH: ".yellow + len);
    console.log("DATA:   ".yellow + postData);
}

var assembleDownlinkPacket = function (opcode, postData) {
    console.log("Assembling downlink packet... ".yellow);
    opcode = utils.padWithZeros(opcode);
    var len = calculatePacketLen(postData);
    var seqNum = nodeConfig.getDownlinkSeqNumber();
    logPacket(opcode, seqNum, len, postData);

    var packet = opcode + seqNum + len + postData;
    logHandler.logger.log('info', 'OUTGOING DOWNLINK', { 'seq_num': seqNum, 'opcode': opcode, 'len': len, 'data': postData, 'assembled_packet': packet});
    console.log("Assembled downlink packet: ".yellow + packet);
    return utils.hexToBase64(packet);
}


exports.sendDownlink = function (opcode, postData) {

    var packet = assembleDownlinkPacket(opcode, postData);
    console.log("Assembled downlink packet (base64): ".yellow + packet);

    var dlFcnt = nodeConfig.getdownlinkFrameCount();
    rest.doRest("POST", "/rest/nodes/0004a30b001b0af1/payloads/dl?fcnt="+dlFcnt+"&port=01&confirmed=false", packet, function (status, m) {

    }, orbiwiseConfig.config());

    nodeConfig.incrementDownlinkFrameCount();
    nodeConfig.incrementDownlinkSeqNumber();
}