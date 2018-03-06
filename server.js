/*jslint node: true, sloppy: true, bitwise: true, vars: true, eqeq: true, plusplus: true, nomen: true, es5:true */
/* Pervasive Nation */
/* 01 Feb 2018 */

/*
   PACKAGES DECLARATION
   To install packages, run npm install, e.g.
     npm install http
     npm install express
     npm install basic-auth
     npm install url
*/

var http = require('http');
var express = require('express');
var orbiwiseConfig = require('./orbiwiseConfig.js');
var putHandler = require('./putHandler.js');
var postHandler = require('./postHandler.js');
var utils = require('./utilityFunctions.js');
var loggingHandler = require('./loggingHandler.js');
require('colors');

var args = process.argv;
var appSrvrPort = parseInt(args[2], 10);
var appSrvrHost = args[3];

var action = utils.checkCommandLineArgs(args);

// allow to do HTTPS to self signed servers.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//   PUSH REGISTER / UNREGISTER functions
if (action == "stop") {
    orbiwiseConfig.stopPush();

} else {

    loggingHandler.setUpLogs();

    var appServer = express();
    var httpServer = http.createServer(appServer).listen(appSrvrPort, function () {
        var host = httpServer.address().address;
        var port = httpServer.address().port;
        console.log('Starting server listening on port ' + port);
        // Registration for PUSH
        orbiwiseConfig.startPush(null, appSrvrHost, appSrvrPort);
    });

    // PUT management from DASS
    appServer.put('/*', putHandler.handlePut);

    // POST managament from DASS 
    appServer.post('/*', postHandler.handlePost);
}
