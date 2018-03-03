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

var startTimeStr = year + "_" + month + "_" + day + "__" + hour + "_" + minute + "_" + seconds;

var restAPIFilename = path.join('./logs/', 'restAPILogfile_' + startTimeStr + '.log');
var nodeCommsFilename = path.join('./logs/', 'nodeCommsLogfile_' + startTimeStr + '.log');

//
// Remove the file, ignoring any errors
//
try { fs.unlinkSync(restAPIFilename); }
catch (ex) { }

try { fs.unlinkSync(nodeCommsFilename); }
catch (ex) { }

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