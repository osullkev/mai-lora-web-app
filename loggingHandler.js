var fs = require('fs'),
    path = require('path'),
    winston = require('winston');


var startTime = new Date(Date.now());

var day = startTime.getDate();
var month = startTime.getMonth() + 1;
var year = startTime.getFullYear();
var hour = startTime.getHours();
var minute = startTime.getMinutes();
var seconds = startTime.getSeconds();

var startTimeStr = year + "-" + month + "-" + day + "__" + hour + "-" + minute + "-" + seconds;
var fpath = "./results/Protocol_Notify_Each_Received_Packet/sf11/1000b/logs_" + startTimeStr;
// var fpath = "./results/Protocol_Recover_At_END/sf7/1000b/logs_" + startTimeStr;
var restAPIFilename = path.join(fpath, 'restAPILogfile_' + startTimeStr + '.log');
var nodeCommsFilename = path.join(fpath, 'nodeCommsLogfile_' + startTimeStr + '.log');


exports.setUpLogs = function ()
{
    try{
        console.log("Setting up log files...");
        fs.mkdirSync(fpath);
        fs.closeSync(fs.openSync(fpath + "/restAPILogfile_" + startTimeStr + ".log", 'w'));
        fs.closeSync(fs.openSync(fpath + "/nodeCommsLogfile_" + startTimeStr + ".log", 'w'));
        fs.closeSync(fs.openSync(fpath + "/arduinoSerialLogfile_" + startTimeStr + ".log", 'w'));
    }
    catch (err){
        throw err;
    }
}

exports.restAPILogger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: restAPIFilename })
    ]
});

exports.nodeCommsLogger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: nodeCommsFilename })
    ]
});
