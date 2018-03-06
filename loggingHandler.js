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

var restAPIFilename = path.join('./logs/', 'restAPILogfile_' + startTimeStr + '.log');
var nodeCommsFilename = path.join('./logs/', 'nodeCommsLogfile_' + startTimeStr + '.log');


exports.setUpLogs = function ()
{
    try{
        console.log("Setting up log files...");
        var path = "./logs/logs_" + startTimeStr;
        fs.mkdirSync(path);
        fs.closeSync(fs.openSync(path + "/restAPILogfile_" + startTimeStr + ".log", 'w'));
        fs.closeSync(fs.openSync(path + "/nodeCommsLogfile_" + startTimeStr + ".log", 'w'));
        fs.closeSync(fs.openSync(path + "/arduinoSerialLogfile_" + startTimeStr + ".log", 'w'));
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