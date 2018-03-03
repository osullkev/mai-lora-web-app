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

var filename = path.join('./logs/', 'logfile_' + startTimeStr + '.log');

//
// Remove the file, ignoring any errors
//
try { fs.unlinkSync(filename); }
catch (ex) { }

//
// Create a new winston logger instance with two tranports: Console, and File
//
//
exports.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: filename })
    ]
});